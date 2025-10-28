// Strapi specific types

export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, any>;
}

export interface StrapiErrorResponse {
  data: null;
  error: StrapiError;
}

// Strapi API configuration
export interface StrapiConfig {
  url: string;
  apiToken?: string;
  timeout?: number;
}