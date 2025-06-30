import { Link } from 'react-router';
import type { PostListItem } from '~/lib/types';
import { formatDate, generateExcerpt } from '~/lib/utils';

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(post.created_at)}
          </time>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.view_count}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          <Link 
            to={`/posts/${post.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {post.excerpt || generateExcerpt(post.title, 150)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
          
          <Link
            to={`/posts/${post.slug}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Read more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}