import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComments } from '../../../redux/slices/commentsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import styles from './HomePagePostModal.module.css';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import { FaHeart } from 'react-icons/fa';
import commbtn from '../../../assets/comment_btn.svg';
import CommentContent from '../../comments/commentContent/CommentContent';
import EmojiPicker from '../../ui/emojiPicker/EmojiPicker';
import { useOptimisticLike } from '../../../hooks/useOptimisticLike';
import { useAddComment } from '../../../hooks/useAddComment';
import { getAuthorInfo } from '../../../utils/author';
import type { IPost, PostPreview } from '../../../interfaces/post.interface';

type ModalPost = IPost | PostPreview;

interface ModalProps {
  post: ModalPost;
  onClose: () => void;
}

const HomePagePostModal: React.FC<ModalProps> = ({ post, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const initLiked = 'isLikedByMe' in post ? !!post.isLikedByMe : false;
  const initLikesCount = 'likesCount' in post && typeof post.likesCount === 'number' ? post.likesCount : 0;
  const initCommentsCount = 'commentsCount' in post && typeof post.commentsCount === 'number' ? post.commentsCount : 0;

  const [commentsCount, setCommentsCount] = useState<number>(initCommentsCount);

  const { isLiked, likesCount, toggleLike } = useOptimisticLike(
    post._id,
    initLiked,
    initLikesCount,
  );

  const { newComment, setNewComment, error, handleAddComment } = useAddComment(
    post._id,
    () => setCommentsCount((p) => p + 1),
  );

  useEffect(() => {
    dispatch(fetchComments(post._id));
    if ('likesCount' in post && typeof post.likesCount === 'number') {
      // sync on post change handled by hook initial state
    }
    if ('commentsCount' in post && typeof post.commentsCount === 'number') {
      setCommentsCount(post.commentsCount);
    }

    const onEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [dispatch, post, onClose]);

  // Author info
  const authorUsername = 'author' in post
    ? getAuthorInfo(post.author).name
    : 'User';
  const authorId = 'author' in post
    ? getAuthorInfo(post.author).id
    : '';
  const authorImage = 'author' in post
    ? getAuthorInfo(post.author).image
    : undefined;
  const description = 'description' in post ? post.description : undefined;

  const goToAuthorProfile = (): void => {
    if (authorId) {
      onClose();
      navigate(`/profile/${authorId}`);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.modalContent_leftside}>
          <img src={post.image || profilePlaceholder} alt="post" />
        </div>

        <div className={styles.rightBox}>
          <div className={styles.modalContent_rightside}>
            <div className={styles.modalContent_rightside_caption}>
              <span className={styles.gradient_border}>
                <span className={styles.gradient_border_inner}>
                  <img
                    className={styles.avaImg}
                    src={authorImage || profilePlaceholder}
                    alt="profile"
                  />
                </span>
              </span>
              <p>
                <span
                  className={styles.user_name}
                  onClick={goToAuthorProfile}
                  style={{ cursor: 'pointer' }}
                >{authorUsername}</span>
                {description}
              </p>
            </div>

            <div className={styles.commentsSection}>
              <CommentContent postId={post._id} />
            </div>
          </div>

          <div>
            <div className={styles.notifBox}>
              <div className={styles.modalContent_rightside_notifications}>
                <span>
                  <img src={commbtn} className={styles.commentIcon} alt="comment-button" />
                  {commentsCount}
                </span>
                <span>
                  <FaHeart
                    onClick={toggleLike}
                    style={{ cursor: 'pointer', color: isLiked ? 'red' : '#ccc', transition: 'color 0.2s' }}
                    size={18}
                  />
                  {likesCount}
                </span>
              </div>
            </div>

            <div className={styles.addCommentSection}>
              <EmojiPicker onSelectEmoji={(emoji) => setNewComment((p) => p + emoji)} />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className={styles.commentInput}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={styles.commentButton}
              >
                Submit
              </button>
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePagePostModal;
