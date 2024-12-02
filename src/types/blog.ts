export interface BlogRequest {
    draft: string;
    type: 'detailed' | 'creative' | 'concise';
}

export interface BlogResponse {
    text: string;
    status: string;
}