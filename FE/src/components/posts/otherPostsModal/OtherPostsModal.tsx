//модалка предпросмотра
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from './otherModal.module.css';
import commbtn from '../../../assets/comment_btn.svg';
import { FaHeart } from 'react-icons/fa';
import CommentContent from '../../comments/commentContent/CommentContent';
import EmojiPicker from '../../ui/emojiPicker/EmojiPicker';
import { useOptimisticLike } from '../../../hooks/useOptimisticLike';
import { useAddComment } from '../../../hooks/useAddComment';
import { useAppSelector } from '../../../redux/hooks';
import { getAuthorInfo } from '../../../utils/author';
import type { IPost } from '../../../interfaces/post.interface';

interface ModalProps {
  post: IPost;
  onClose: () => void;
  onUpdatePosts: () => void;
}

const OtherPostsModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);

  const { id: authorId, name: authorName, image: authorImage } = getAuthorInfo(post.author);

  const { isLiked, likesCount, toggleLike } = useOptimisticLike(
    post._id,
    post.isLikedByMe ?? false,
    post.likesCount ?? 0,
  );

  const { newComment, setNewComment, error, handleAddComment } = useAddComment(
    post._id,
    () => setCommentsCount((prev) => prev + 1),
  );

  const goToAuthorProfile = (): void => {
    if (authorId) {
      onClose();
      navigate(`/profile/${authorId}`);
    }
  };

  useEffect(() => {
    setCommentsCount(post.commentsCount ?? 0);
  }, [post]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent_leftside}>
          <img src={post.image || profilePlaceholder} alt="post" />
        </div>

        <div className={styles.modalContent_rightside}>
          <button className={styles.closeButton} onClick={onClose}>
            ✖
          </button>

          <div className={styles.modalContent_rightside_caption}>
            <div className={styles.topBlock}>
              <span className={styles.gradient_border}>
                <span className={styles.gradient_border_inner}>
                  <img src={authorImage || profilePlaceholder} alt="profile" />
                </span>
              </span>
              <div className={styles.nameCaption}>
                <span className={styles.user_name} onClick={goToAuthorProfile} style={{ cursor: 'pointer' }}>{authorName}</span>
                <span className={styles.modalCaption}>{post.description}</span>
              </div>
            </div>
          </div>

          <div className={styles.commentsSection}>
            <CommentContent postId={post._id} />
          </div>

          <div>
            <div className={styles.modalContent_rightside_notifications}>
              <span>
                <img src={commbtn} alt="comment-btn" /> {commentsCount}
              </span>
              <span>
                <FaHeart
                  onClick={toggleLike}
                  style={{ cursor: 'pointer', color: isLiked ? 'red' : '#ccc', transition: 'color 0.2s' }}
                  size={18}
                /> {likesCount} Likes
              </span>
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

export default OtherPostsModal;
