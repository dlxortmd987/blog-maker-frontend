// src/services/blogService.ts
import { BlogRequest, BlogResponse } from '@/types/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const generateBlog = async (request: BlogRequest): Promise<BlogResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/blog/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText || 'Unknown error'
            }));

            return Promise.reject({
                status: response.status,
                message: errorData.message
            });
        }

        return response.json();
    } catch (error) {
        console.error('Blog generation error:', error);
        return Promise.reject({
            status: 500,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};