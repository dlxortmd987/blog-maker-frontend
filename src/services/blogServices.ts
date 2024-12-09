// src/services/blogService.ts
import { BlogRequest, BlogResponse } from '@/types/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not defined, falling back to localhost');
}

export const generateBlog = async (request: BlogRequest): Promise<BlogResponse> => {
    const baseUrl = API_BASE_URL || 'http://localhost:8080';

    try {
        const response = await fetch(`${baseUrl}/api/blog/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Blog generation error:', error);
        throw error;
    }
};