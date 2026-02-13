import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchComments, likeComment } from '../../../redux/slices/commentsSlice';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from './commentContent.module.css';
import parseData from '../../../helpers/parseData';
import type { IComment } from '../../../interfaces/comment.interface';

interface CommentContentProps {
  postId: string;
}

const isPopulatedUser = (
  u: IComment['user']
): u is { _id: string; username: string; profileImage?: string } =>
  typeof u !== 'string';

const CommentContent: React.FC<CommentContentProps> = ({ postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const comments = useSelector((s: RootState) => s.comments.comments);
  const loading = useSelector((s: RootState) => s.comments.loading);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const myId = currentUser?._id ?? '';

  const goToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleLikeComment = async (commentId: string) => {
    try {
      await dispatch(likeComment({ commentId })).unwrap();
      dispatch(fetchComments(postId));
    } catch (err) {
      console.error('Ошибка при лайке комментария:', err);
    }
  };

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
                >{u?.username || 'Anonymous'}</strong>
                {' · '}
                {parseData(comment.createdAt)}
              </p>
              <p>{comment.text}</p>
            </div>
            <div className={styles.commentActions}>
              <span>
                <FaHeart
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

export default CommentContent;
