export enum ContentType {
    TRAVLE,
    RESTAURANT,
    PROGRAMMING
}

export interface BlogRequest {
    draft: string;
    contentType: ContentType;
}

export interface BlogResponse {
    text: string;
    status: string;
}