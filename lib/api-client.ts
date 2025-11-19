"use client";

import axios from 'axios';
import { useMemo, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Idea } from '@/components/IdeaCard';

// API base URL - defaults to localhost:8000 for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
            const response = await api.get('/ideas', { params });
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
        sendChatMessage: async (message: string) => {
            const response = await api.post('/chat', { message });
            return response.data;
        },
    }), [api, user]);

    return apiClient;
};

