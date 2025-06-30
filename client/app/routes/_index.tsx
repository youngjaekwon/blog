import { useLoaderData } from 'react-router';
import type { Route } from './+types/_index';
import { postsApi, tagsApi } from '~/lib/api';
import type { PostListResponse, Tag } from '~/lib/types';
import PostCard from '~/components/blog/PostCard';
import TagCloud from '~/components/blog/TagCloud';
import Pagination from '~/components/ui/Pagination';
import { LoadingCard } from '~/components/ui/Loading';
import { generatePageTitle, generateMetaDescription } from '~/lib/utils';

export const meta: Route.MetaFunction = () => {
  return [
    { title: generatePageTitle() },
    { name: 'description', content: generateMetaDescription() },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const search = url.searchParams.get('search') || undefined;

  try {
    const [postsResponse] = await Promise.all([
      postsApi.getList({ page, search, page_size: 10 })
    ]);

    // TODO: Add tags API to Django backend
    const tags = [];

    return {
      posts: postsResponse,
      tags,
      currentPage: page,
      search,
    };
  } catch (error) {
    // Handle API errors gracefully
    console.error('Error loading homepage data:', error);
    return {
      posts: { results: [], count: 0, next: null, previous: null },
      tags: [],
      currentPage: 1,
      search: null,
      error: 'Failed to load blog posts. Please try again later.',
    };
  }
}

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  const { posts, tags, currentPage, search, error } = data;
  const totalPages = Math.ceil(posts.count / 10);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Latest Posts
            </h1>
            {search && (
              <p className="text-gray-600 dark:text-gray-400">
                Search results for: <span className="font-medium">"{search}"</span>
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              {posts.count} post{posts.count !== 1 ? 's' : ''} found
            </p>
          </div>

          {posts.results.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {search ? 'Try adjusting your search terms.' : 'Check back later for new content!'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {posts.results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/"
                    searchParams={new URLSearchParams(search ? { search } : {})}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="mt-12 lg:mt-0">
          <div className="sticky top-8 space-y-8">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search</h3>
              <form method="get" className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Search posts..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Tags */}
            <TagCloud tags={tags} />

            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Welcome to my personal blog where I share thoughts, experiences, and insights about development, technology, and life in general.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}