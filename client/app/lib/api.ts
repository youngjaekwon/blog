import axios, { type AxiosInstance, AxiosError } from 'axios';
import type {
  Post,
  PostListResponse,
  Comment,
  CommentListResponse,
  CommentCreate,
  CommentUpdate,
  CommentDelete,
  Tag,
  PostFilters,
  ApiError,
} from './types';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? process.env.API_BASE_URL || 'http://localhost:8000/api'
    : 'http://localhost:8000/api';

  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add any auth headers if needed in the future
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: error.message || 'An error occurred',
        status: error.response?.status || 500,
        errors: error.response?.data as Record<string, string[]>,
      };
      
      return Promise.reject(apiError);
    }
  );

  return client;
};

const api = createApiClient();

// Post API functions
export const postsApi = {
  // Get paginated list of published posts
  async getList(filters: PostFilters = {}): Promise<PostListResponse> {
    const params = new URLSearchParams();
    
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    const response = await api.get(`/posts/?${params.toString()}`);
    return response.data;
  },

  // Get single post by slug (increments view count)
  async getBySlug(slug: string): Promise<Post> {
    const response = await api.get(`/posts/slug/${slug}/`);
    return response.data;
  },

  // Get posts by tag (fallback to regular posts until backend implements tags)
  async getByTag(tagSlug: string, page = 1): Promise<PostListResponse> {
    // TODO: Implement tag filtering in Django backend
    const response = await api.get(`/posts/?page=${page}`);
    return response.data;
  },
};

// Comment API functions
export const commentsApi = {
  // Get comments for a post
  async getByPostId(postId: number): Promise<CommentListResponse> {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },

  // Create new comment
  async create(postId: number, commentData: CommentCreate): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments/`, commentData);
    return response.data;
  },

  // Update comment (requires password)
  async update(commentId: number, commentData: CommentUpdate): Promise<Comment> {
    const response = await api.put(`/comments/${commentId}/`, commentData);
    return response.data;
  },

  // Delete comment (requires password)
  async delete(commentId: number, password: CommentDelete): Promise<void> {
    await api.delete(`/comments/${commentId}/`, { data: password });
  },
};

// Tag API functions
export const tagsApi = {
  // Get all tags with post counts (TODO: Implement in Django backend)
  async getAll(): Promise<Tag[]> {
    // TODO: Implement tags API in Django backend
    return [];
  },

  // Get posts by tag
  async getPosts(tagSlug: string, page = 1): Promise<PostListResponse> {
    return postsApi.getByTag(tagSlug, page);
  },
};

// Export default API client for custom requests
export default api;