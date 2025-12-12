"use client";

import axios from 'axios';
import { useMemo, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Idea } from '@/components/IdeaCard';

// API base URL - defaults to localhost:8000 for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
    throw new Error(
        'NEXT_PUBLIC_API_URL is not defined!\n' +
        'Development: Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000\n' +
        'Production: Set NEXT_PUBLIC_API_URL in Cloud Run environment variables'
    );
}

// Create a client-side API wrapper that includes auth tokens
export const useApiClient = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    const api = useMemo(() => axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    }), []);

    // Set up request interceptor - update when user changes
    useEffect(() => {
        // Add auth token and user ID to requests
        const requestInterceptor = api.interceptors.request.use(
            async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                // Add X-User-Id header if user is authenticated
                if (user?.id) {
                    config.headers['X-User-Id'] = user.id;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Cleanup: remove interceptor when component unmounts or user changes
        return () => {
            api.interceptors.request.eject(requestInterceptor);
        };
    }, [api, getToken, user]);

    // Set up response interceptor once
    useEffect(() => {
        // Response interceptor (handle errors globally)
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle common errors
                if (error.response) {
                    // Server responded with error
                    const errorData = error.response.data;
                    if (errorData && Object.keys(errorData).length > 0) {
                        console.error('API Error:', errorData);
                    } else {
                        console.error('API Error:', {
                            status: error.response.status,
                            statusText: error.response.statusText,
                            message: `HTTP ${error.response.status}: ${error.response.statusText}`,
                        });
                    }
                } else if (error.request) {
                    // Request made but no response (network error, CORS, backend down)
                    console.error('Network Error: No response from server. Is the backend running?', {
                        message: error.message,
                        code: error.code,
                    });
                } else {
                    // Something else happened
                    console.error('Error:', error.message || 'Unknown error occurred');
                }
                return Promise.reject(error);
            }
        );

        // Cleanup: remove interceptor when component unmounts
        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [api]);

    // API functions - memoized to prevent recreating on every render
    const apiClient = useMemo(() => ({
        // Get all ideas
        getIdeas: async (params?: {
            search?: string;
            tags?: string[];
            sort_by?: string;
            page?: number;
            limit?: number;
        }) => {
            // Build query params - ensure tags[] format for backend
            const queryParams: Record<string, unknown> = {};
            if (params?.search) queryParams.search = params.search;
            if (params?.tags && params.tags.length > 0) {
                // Pass as 'tags' - axios will serialize array as tags[]=value1&tags[]=value2
                queryParams.tags = params.tags;
            }
            if (params?.sort_by) queryParams.sort_by = params.sort_by;
            if (params?.page) queryParams.page = params.page;
            if (params?.limit) queryParams.limit = params.limit;

            const response = await api.get('/ideas', {
                params: queryParams,
                // Ensure arrays are serialized with brackets: tags[]=value
                paramsSerializer: {
                    indexes: null, // This makes axios serialize arrays as tags[]=value
                }
            });
            return response.data;
        },

        // Get single idea by ID
        getIdea: async (id: string) => {
            const response = await api.get(`/ideas/${id}`);
            return response.data;
        },

        // Add new idea (user_id and author are added automatically from Clerk)
        addIdea: async (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes' | 'views' | 'status' | 'author'>) => {
            // Get user name from Clerk
            const userName = user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`.trim()
                : user?.firstName || user?.lastName || 'Anonymous';

            // Backend expects camelCase for marketSize
            // Default marketSize to "Medium" if not provided
            const requestData: Record<string, unknown> = {
                title: ideaData.title,
                description: ideaData.description,
                problem: ideaData.problem,
                solution: ideaData.solution,
                marketSize: ideaData.marketSize || 'Medium',
                tags: ideaData.tags,
                user_id: user?.id || '',
                author: userName,
            };

            // Include link only if provided
            if (ideaData.link) {
                requestData.link = ideaData.link;
            }

            const response = await api.post('/ideas/add', requestData);
            return response.data;
        },

        // Update idea
        updateIdea: async (id: string, ideaData: Partial<Idea>) => {
            // Backend expects camelCase for marketSize
            const backendData: Record<string, unknown> = {};
            if (ideaData.title !== undefined) backendData.title = ideaData.title;
            if (ideaData.description !== undefined) backendData.description = ideaData.description;
            if (ideaData.problem !== undefined) backendData.problem = ideaData.problem;
            if (ideaData.solution !== undefined) backendData.solution = ideaData.solution;
            if (ideaData.marketSize !== undefined) backendData.marketSize = ideaData.marketSize;
            if (ideaData.tags !== undefined) backendData.tags = ideaData.tags;
            // Always include link (can be null to clear it in database)
            if (ideaData.link !== undefined) backendData.link = ideaData.link;

            const response = await api.put(`/ideas/${id}`, backendData);
            return response.data;
        },

        // Delete idea
        deleteIdea: async (id: string) => {
            const response = await api.delete(`/ideas/${id}`);
            return response.data;
        },

        // Send chat message
        sendChatMessage: async (message: string, chatId?: string) => {
            const requestBody: Record<string, unknown> = { message };
            // Only include chat_id if it exists (for continuing existing chat)
            if (chatId) {
                requestBody.chat_id = chatId;
            }
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.post('/chat', requestBody);
            return response.data;
        },

        // Send chat message with streaming support
        sendChatMessageStream: async (
            message: string,
            chatId: string | undefined,
            onToken: (token: string) => void,
            onComplete: (fullText: string) => void,
            onError: (error: Error) => void | Promise<void>
        ) => {
            const token = await getToken();
            const requestBody: Record<string, unknown> = { message, stream: true };
            if (chatId) {
                requestBody.chat_id = chatId;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            if (user?.id) {
                headers['X-User-Id'] = user.id;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/chat`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let fullText = '';

                if (!reader) {
                    throw new Error('No response body reader available');
                }

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.trim() === '') continue;

                        // Handle Server-Sent Events format
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.token) {
                                    fullText += parsed.token;
                                    onToken(parsed.token);
                                } else if (parsed.content) {
                                    fullText += parsed.content;
                                    onToken(parsed.content);
                                } else if (typeof parsed === 'string') {
                                    fullText += parsed;
                                    onToken(parsed);
                                }
                            } catch {
                                // If not JSON, treat as plain text
                                fullText += data;
                                onToken(data);
                            }
                        } else if (line.startsWith('{')) {
                            // Try to parse as JSON
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.token) {
                                    fullText += parsed.token;
                                    onToken(parsed.token);
                                } else if (parsed.content) {
                                    fullText += parsed.content;
                                    onToken(parsed.content);
                                }
                            } catch {
                                // If not valid JSON, treat as plain text
                                fullText += line;
                                onToken(line);
                            }
                        } else {
                            // Plain text chunk
                            fullText += line;
                            onToken(line);
                        }
                    }
                }

                // Process any remaining buffer
                if (buffer.trim()) {
                    fullText += buffer;
                    onToken(buffer);
                }

                onComplete(fullText);
            } catch (error) {
                const errorResult = onError(error instanceof Error ? error : new Error('Streaming error'));
                // If onError returns a promise, await it
                if (errorResult instanceof Promise) {
                    await errorResult;
                }
            }
        },

        // Get chat history
        getChatHistory: async () => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.get('/chat/list');
            return response.data;
        },

        // Create new chat
        createNewChat: async () => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.post('/chat/new');
            return response.data;
        },

        // Get or create empty chat (reuses existing empty chat or creates new)
        getEmptyChat: async () => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.get('/chat/empty');
            return response.data;
        },

        // Delete a chat
        deleteChat: async (chatId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.delete(`/chat/${chatId}`);
            return response.data;
        },

        // Get messages for a specific chat
        getChatMessages: async (chatId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.get(`/chat/${chatId}/messages`);
            return response.data;
        },

        // Increment idea views (public endpoint, no auth required)
        incrementIdeaViews: async (ideaId: string) => {
            // This is a public endpoint, so we don't need auth headers
            // Use a separate axios instance without auth for this call
            const publicApi = axios.create({
                baseURL: API_BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await publicApi.post(`/ideas/${ideaId}/view`);
            return response.data;
        },

        // Upvote idea (requires authentication - X-User-Id header is automatically added)
        upvoteIdea: async (ideaId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.post(`/ideas/${ideaId}/upvote`);
            return response.data;
        },

        // Remove upvote from idea (requires authentication - X-User-Id header is automatically added)
        removeUpvote: async (ideaId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.delete(`/ideas/${ideaId}/upvote`);
            return response.data;
        },

        // Check if current user has upvoted an idea (requires authentication)
        checkUpvoteStatus: async (ideaId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.get(`/ideas/${ideaId}/upvote-status`);
            return response.data;
        },

        // Get all comments for an idea (public endpoint)
        getIdeaComments: async (ideaId: string) => {
            const response = await api.get(`/ideas/${ideaId}/comments`);
            return response.data;
        },

        // Create a comment (requires authentication)
        // parentCommentId is optional - if provided, creates a reply to that comment
        createComment: async (ideaId: string, content: string, parentCommentId?: string | null) => {
            // X-User-Id header is automatically added by the request interceptor
            const requestBody: Record<string, unknown> = { content };
            if (parentCommentId) {
                requestBody.parent_comment_id = parentCommentId;
            }
            const response = await api.post(`/ideas/${ideaId}/comments`, requestBody);
            return response.data;
        },

        // Delete a comment (requires authentication)
        deleteComment: async (ideaId: string, commentId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.delete(`/ideas/${ideaId}/comments/${commentId}`);
            return response.data;
        },

        // Convert chat to idea
        convertChatToIdea: async (chatId: string) => {
            // X-User-Id header is automatically added by the request interceptor
            const response = await api.post('/chat/convert-to-idea', {
                chat_id: chatId,
            });
            return response.data;
        },
    }), [api, user]);

    return apiClient;
};

