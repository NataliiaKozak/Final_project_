import { useState, useCallback } from 'react';
import { $api } from '../api/api';
import type { LikeResponse } from '../interfaces/api.interface';

interface UseOptimisticLikeResult {
  isLiked: boolean;
  likesCount: number;
  toggleLike: () => Promise<void>;
}

export function useOptimisticLike(
  postId: string,
  initialLiked: boolean,
  initialCount: number,
  onCountChange?: (postId: string, count: number) => void,
): UseOptimisticLikeResult {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);

  const updateCount = useCallback(
    (count: number) => {
      setLikesCount(count);
      onCountChange?.(postId, count);
    },
    [postId, onCountChange],
  );

  const toggleLike = useCallback(async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    updateCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const { data } = await $api.post<LikeResponse>(`/likes/post/${postId}`);
      setIsLiked(data.liked);
      updateCount(data.likesCount);
    } catch {
      setIsLiked(prevLiked);
      updateCount(prevCount);
    }
  }, [postId, isLiked, likesCount, updateCount]);

  return { isLiked, likesCount, toggleLike };
}
