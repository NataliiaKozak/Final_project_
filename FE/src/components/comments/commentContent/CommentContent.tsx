import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchComments, likeComment } from '../../../redux/slices/commentsSlice';
import { isPopulatedUser } from '../../../utils/populatedUser';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from './commentContent.module.css';
import parseData from '../../../helpers/parseData';

interface CommentContentProps {
  postId: string;
}

const CommentContent: React.FC<CommentContentProps> = ({ postId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const comments = useAppSelector((s) => s.comments.comments);
  const loading = useAppSelector((s) => s.comments.loading);
  const myId = useAppSelector((s) => s.auth.user?._id) ?? '';

  const goToProfile = useCallback(
    (userId: string) => navigate(`/profile/${userId}`),
    [navigate],
  );

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleLikeComment = useCallback(
    async (commentId: string) => {
      try {
        await dispatch(likeComment({ commentId })).unwrap();
        dispatch(fetchComments(postId));
      } catch (err: unknown) {
        if (err instanceof Error) console.error('Comment like error:', err.message);
      }
    },
    [dispatch, postId],
  );

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className={styles.commentsSection}>
      {comments.map((comment) => {
        const u = isPopulatedUser(comment.user) ? comment.user : undefined;
        const isLiked = (comment.likes ?? []).includes(myId);

        return (
          <div key={comment._id} className={styles.comment}>
            <img
              src={u?.profileImage || profilePlaceholder}
              alt="comment-avatar"
              className={styles.commentAvatar}
              onClick={() => u && goToProfile(u._id)}
              style={{ cursor: u ? 'pointer' : undefined }}
            />
            <div className={styles.commentContent}>
              <p>
                <strong
                  onClick={() => u && goToProfile(u._id)}
                  style={{ cursor: u ? 'pointer' : undefined }}
                >
                  {u?.username || 'Anonymous'}
                </strong>
                {' · '}
                {parseData(comment.createdAt)}
              </p>
              <p>{comment.text}</p>
            </div>
            <div className={styles.commentActions}>
              <span>
                <FaHeart
                  role="button"
                  aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
                  tabIndex={0}
                  className={isLiked ? styles.liked : styles.unliked}
                  onClick={() => handleLikeComment(comment._id)}
                  size={14}
                />
                <span>{comment.likesCount ?? 0}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CommentContent);
