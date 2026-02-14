import { useState, useCallback, type SetStateAction } from 'react';
import { addComment } from '../redux/slices/commentsSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

interface UseAddCommentResult {
  newComment: string;
  setNewComment: (value: SetStateAction<string>) => void;
  error: string | null;
  handleAddComment: () => Promise<void>;
}

export function useAddComment(
  postId: string,
  onCommentAdded?: () => void,
): UseAddCommentResult {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddComment = useCallback(async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    const text = newComment.trim();
    if (!text) return;

    try {
      await dispatch(addComment({ postId, text })).unwrap();
      setNewComment('');
      setError(null);
      onCommentAdded?.();
    } catch {
      setError('Error adding comment');
    }
  }, [dispatch, currentUser, newComment, postId, onCommentAdded]);

  return { newComment, setNewComment, error, handleAddComment };
}
