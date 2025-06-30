import { useLoaderData, Link } from 'react-router';
import type { Route } from './+types/tags.$tag';
import { postsApi, tagsApi } from '~/lib/api';
import type { PostListResponse, Tag } from '~/lib/types';
import PostCard from '~/components/blog/PostCard';
import TagCloud from '~/components/blog/TagCloud';
import Pagination from '~/components/ui/Pagination';
import { generatePageTitle, generateMetaDescription } from '~/lib/utils';

export const meta: Route.MetaFunction = ({ data }) => {
  try {
    if (!data || 'error' in data) {
      return [
        { title: generatePageTitle('Tag Not Found') },
        { name: 'description', content: 'The requested tag could not be found.' },
      ];
    }

    const tagName = data.currentTag?.name || data.tagSlug;
    return [
      { title: generatePageTitle(`Posts tagged with "${tagName}"`) },
      { name: 'description', content: `Browse all blog posts tagged with "${tagName}".` },
    ];
  } catch (error) {
    console.error('Meta function error:', error);
    return [
      { title: generatePageTitle('Tags') },
      { name: 'description', content: 'Browse blog posts by tags' },
    ];
  }
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const { tag: tagSlug } = params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  if (!tagSlug) {
    throw new Response('Tag slug is required', { status: 400 });
  }

  try {
    const [postsResponse] = await Promise.all([
      postsApi.getByTag(tagSlug, page)
    ]);

    // TODO: Add tags API to Django backend
    const allTags = [];
    const currentTag = { id: 1, name: tagSlug, slug: tagSlug };

    return {
      posts: postsResponse,
      allTags,
      currentTag,
      tagSlug,
      currentPage: page,
    };
  } catch (error: any) {
    if (error.status === 404) {
      throw new Response('Tag not found', { status: 404 });
    }
    
    return {
      error: 'Failed to load posts for this tag. Please try again later.',
      tagSlug,
    };
  }
}

export default function TagPage() {
  const data = useLoaderData<typeof loader>();

  // Handle loading state
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

  // Handle error state
  if ('error' in data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{data.error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { posts, allTags, currentTag, tagSlug, currentPage } = data;
  const totalPages = Math.ceil(posts.count / 10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <Link
                to="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Home
              </Link>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">
                Tag: {currentTag?.name || tagSlug}
              </span>
            </div>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Posts tagged with "
              <span className="text-blue-600 dark:text-blue-400">
                #{currentTag?.name || tagSlug}
              </span>
              "
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              {posts.count} post{posts.count !== 1 ? 's' : ''} found
            </p>
          </div>

          {posts.results.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts found with this tag
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                It looks like there are no published posts with the tag "#{currentTag?.name || tagSlug}".
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Browse all posts
              </Link>
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
                    baseUrl={`/tags/${tagSlug}`}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="mt-12 lg:mt-0">
          <div className="sticky top-8 space-y-8">
            {/* All Tags */}
            <TagCloud tags={allTags} selectedTag={tagSlug} />

            {/* Tag Info */}
            {currentTag && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tag Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tag:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{currentTag.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total posts:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentTag.post_count || posts.count}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    View all posts
                  </Link>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search</h3>
              <form action="/" method="get" className="relative">
                <input
                  type="text"
                  name="search"
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
          </div>
        </div>
      </div>
    </div>
  );
}