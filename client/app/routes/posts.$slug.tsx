import { useLoaderData, useActionData, Link } from 'react-router';
import { redirect } from 'react-router';
import type { Route } from './+types/posts.$slug';
import { postsApi, commentsApi } from '~/lib/api';
import type { Post, Comment, CommentCreate, CommentUpdate, CommentDelete } from '~/lib/types';
import { formatDate, parseMarkdown, generatePageTitle, generateMetaDescription } from '~/lib/utils';
import CommentForm from '~/components/blog/CommentForm';
import CommentList from '~/components/blog/CommentList';
import Loading from '~/components/ui/Loading';
import { useState, useEffect } from 'react';

export const meta: Route.MetaFunction = ({ data }) => {
  try {
    if (!data || 'error' in data) {
      return [
        { title: generatePageTitle('Post Not Found') },
        { name: 'description', content: 'The requested blog post could not be found.' },
      ];
    }

    return [
      { title: generatePageTitle(data.post.title) },
      { name: 'description', content: generateMetaDescription(data.post.content) },
      { property: 'og:title', content: data.post.title },
      { property: 'og:description', content: generateMetaDescription(data.post.content) },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: data.post.created_at },
      { property: 'article:modified_time', content: data.post.updated_at },
    ];
  } catch (error) {
    console.error('Meta function error:', error);
    return [
      { title: generatePageTitle('Blog Post') },
      { name: 'description', content: 'Blog post content' },
    ];
  }
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response('Post slug is required', { status: 400 });
  }

  try {
    const [post, commentsResponse] = await Promise.all([
      postsApi.getBySlug(slug),
      commentsApi.getByPostId(-1) // We'll get post ID after loading post
    ]);

    // Get comments for the specific post
    const comments = await commentsApi.getByPostId(post.id);

    return {
      post,
      comments: comments.results,
    };
  } catch (error: any) {
    if (error.status === 404) {
      throw new Response('Post not found', { status: 404 });
    }
    
    return {
      error: 'Failed to load blog post. Please try again later.',
    };
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { slug } = params;
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;

  if (!slug) {
    return { error: 'Post slug is required' };
  }

  try {
    // Get post to retrieve post ID
    const post = await postsApi.getBySlug(slug);

    switch (actionType) {
      case 'create': {
        const commentData: CommentCreate = {
          nickname: (formData.get('nickname') as string) || undefined,
          content: formData.get('content') as string,
          password: formData.get('password') as string,
        };

        await commentsApi.create(post.id, commentData);
        return { success: true, message: 'Comment added successfully!' };
      }

      case 'update': {
        const commentId = parseInt(formData.get('commentId') as string, 10);
        const updateData: CommentUpdate = {
          nickname: (formData.get('nickname') as string) || undefined,
          content: formData.get('content') as string,
          password: formData.get('password') as string,
        };

        await commentsApi.update(commentId, updateData);
        return { success: true, message: 'Comment updated successfully!' };
      }

      case 'delete': {
        const commentId = parseInt(formData.get('commentId') as string, 10);
        const deleteData: CommentDelete = {
          password: formData.get('password') as string,
        };

        await commentsApi.delete(commentId, deleteData);
        return { success: true, message: 'Comment deleted successfully!' };
      }

      default:
        return { error: 'Invalid action type' };
    }
  } catch (error: any) {
    return { 
      error: error.message || 'An error occurred while processing your request.',
      details: error.errors 
    };
  }
}

export default function PostDetailPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { post } = data;

  // Initialize comments from loader data
  useEffect(() => {
    if (data && 'comments' in data) {
      setComments(data.comments);
    }
  }, [data]);

  // Handle successful actions
  useEffect(() => {
    if (actionData?.success && typeof window !== 'undefined') {
      // Reload comments after successful action
      window.location.reload();
    }
  }, [actionData]);

  const handleCommentSubmit = async (commentData: CommentCreate) => {
    if (typeof window === 'undefined') return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('actionType', 'create');
    formData.append('nickname', commentData.nickname || '');
    formData.append('content', commentData.content);
    formData.append('password', commentData.password);

    try {
      // Use the form submission approach for server actions
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';
      
      Array.from(formData.entries()).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = async (commentId: number, updateData: CommentUpdate) => {
    if (typeof window === 'undefined') return;
    
    const formData = new FormData();
    formData.append('actionType', 'update');
    formData.append('commentId', commentId.toString());
    formData.append('nickname', updateData.nickname || '');
    formData.append('content', updateData.content);
    formData.append('password', updateData.password);

    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    
    Array.from(formData.entries()).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
  };

  const handleCommentDelete = async (commentId: number, deleteData: CommentDelete) => {
    if (typeof window === 'undefined') return;
    
    const formData = new FormData();
    formData.append('actionType', 'delete');
    formData.append('commentId', commentId.toString());
    formData.append('password', deleteData.password);

    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    
    Array.from(formData.entries()).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          ← Back to Posts
        </Link>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-4">
            <time>{formatDate(post.created_at)}</time>
            {post.updated_at !== post.created_at && (
              <span>(Updated: {formatDate(post.updated_at)})</span>
            )}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.view_count} views
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Post content */}
      <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <div 
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />
      </article>

      {/* Comments section */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Comments ({comments.length})
        </h2>

        {/* Action feedback */}
        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-400">{actionData.error}</p>
            {actionData.details && (
              <pre className="mt-2 text-sm text-red-700 dark:text-red-300">
                {JSON.stringify(actionData.details, null, 2)}
              </pre>
            )}
          </div>
        )}

        {actionData?.success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-400">{actionData.message}</p>
          </div>
        )}

        {/* Comment form */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Leave a Comment
          </h3>
          <CommentForm
            postId={post.id}
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Comments list */}
        <CommentList
          comments={comments}
          onUpdate={handleCommentUpdate}
          onDelete={handleCommentDelete}
        />
      </section>
    </div>
  );
}