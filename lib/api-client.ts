"use client";

import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { Idea } from '@/components/IdeaCard';

// API base URL - defaults to localhost:8000 for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a client-side API wrapper that includes auth tokens
export const useApiClient = () => {
    const { getToken } = useAuth();

    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add auth token to requests
    api.interceptors.request.use(
        async (config) => {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor (handle errors globally)
    api.interceptors.response.use(
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

    // API functions
    const apiClient = {
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

        // Add new idea
        addIdea: async (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes' | 'views' | 'status'>) => {
            const response = await api.post('/ideas/add', ideaData);
            return response.data;
        },

        // Update idea
        updateIdea: async (id: string, ideaData: Partial<Idea>) => {
            const response = await api.put(`/ideas/${id}`, ideaData);
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
    };

    return apiClient;
};

