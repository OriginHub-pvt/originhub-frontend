import axios from 'axios';
import { Idea } from '@/components/IdeaCard';

// API base URL - defaults to localhost:8000 for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to get auth token for client-side requests
// Note: For client-side API calls, use the useApiClient hook from lib/api-client.ts
// This file maintains the server-side compatible API client

// Request interceptor - will be enhanced by client-side wrapper
api.interceptors.request.use(
    (config) => {
        // Token will be added by the client-side wrapper
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
export const apiClient = {
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

export default api;

