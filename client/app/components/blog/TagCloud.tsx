import { Link } from 'react-router';
import type { Tag } from '~/lib/types';

interface TagCloudProps {
  tags: Tag[];
  selectedTag?: string;
}

export default function TagCloud({ tags, selectedTag }: TagCloudProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/"
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedTag
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Posts
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.id}
            to={`/tags/${tag.slug}`}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag.slug
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            #{tag.name}
            {tag.post_count && (
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                ({tag.post_count})
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}