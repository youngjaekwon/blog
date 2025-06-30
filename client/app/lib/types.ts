// Blog post types
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  tags: Tag[];
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  tags: Tag[];
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

// Comment types
export interface Comment {
  id: number;
  post: number;
  nickname?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CommentCreate {
  nickname?: string;
  content: string;
  password: string;
}

export interface CommentUpdate {
  nickname?: string;
  content: string;
  password: string;
}

export interface CommentDelete {
  password: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PostListResponse extends PaginatedResponse<PostListItem> {}
export interface CommentListResponse extends PaginatedResponse<Comment> {}

// API error types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Search and filter types
export interface PostFilters {
  tag?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PostSearchParams {
  q?: string;
  tag?: string;
  page?: string;
}