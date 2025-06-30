import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateExcerpt(content: string, length = 150): string {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();

  return truncateText(plainText, length);
}

// URL utilities
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// SEO utilities
export function generatePageTitle(title?: string): string {
  const siteName = 'My Blog';
  return title ? `${title} | ${siteName}` : siteName;
}

export function generateMetaDescription(content?: string): string {
  const defaultDescription = 'Personal blog about development, technology, and thoughts';
  if (!content) return defaultDescription;
  
  const excerpt = generateExcerpt(content, 160);
  return excerpt || defaultDescription;
}

// Local storage utilities (for client-side only)
export function getFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setToStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

// Markdown utilities
import { marked } from 'marked';

// Configure marked for better HTML output
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function parseMarkdown(content: string): string {
  return marked(content) as string;
}