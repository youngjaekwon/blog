import { useState } from 'react';
import type { Comment, CommentUpdate, CommentDelete } from '~/lib/types';
import { formatDateTime } from '~/lib/utils';

interface CommentListProps {
  comments: Comment[];
  onUpdate: (commentId: number, updateData: CommentUpdate) => Promise<void>;
  onDelete: (commentId: number, deleteData: CommentDelete) => Promise<void>;
}

interface EditingComment {
  id: number;
  nickname: string;
  content: string;
  password: string;
}

export default function CommentList({ comments, onUpdate, onDelete }: CommentListProps) {
  const [editingComment, setEditingComment] = useState<EditingComment | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (comment: Comment) => {
    setEditingComment({
      id: comment.id,
      nickname: comment.nickname || '',
      content: comment.content,
      password: '',
    });
  };

  const handleEditCancel = () => {
    setEditingComment(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;

    setIsSubmitting(true);
    try {
      await onUpdate(editingComment.id, {
        nickname: editingComment.nickname,
        content: editingComment.content,
        password: editingComment.password,
      });
      setEditingComment(null);
    } catch (error) {
      // Error handling will be done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: number) => {
    setDeletingCommentId(commentId);
    setDeletePassword('');
  };

  const handleDeleteCancel = () => {
    setDeletingCommentId(null);
    setDeletePassword('');
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCommentId || !deletePassword.trim()) return;

    setIsSubmitting(true);
    try {
      await onDelete(deletingCommentId, { password: deletePassword });
      setDeletingCommentId(null);
      setDeletePassword('');
    } catch (error) {
      // Error handling will be done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.nickname || 'Anonymous'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditClick(comment)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                disabled={isSubmitting}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(comment.id)}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                disabled={isSubmitting}
              >
                Delete
              </button>
            </div>
          </div>

          {editingComment?.id === comment.id ? (
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editingComment.nickname}
                  onChange={(e) => setEditingComment({ ...editingComment, nickname: e.target.value })}
                  placeholder="Nickname (optional)"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  disabled={isSubmitting}
                />
                <input
                  type="password"
                  value={editingComment.password}
                  onChange={(e) => setEditingComment({ ...editingComment, password: e.target.value })}
                  placeholder="Password"
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              <textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting || !editingComment.content.trim() || !editingComment.password.trim()}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* Delete confirmation */}
          {deletingCommentId === comment.id && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-400 mb-2">
                Are you sure you want to delete this comment?
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password to confirm"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleDeleteCancel}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isSubmitting || !deletePassword.trim()}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}