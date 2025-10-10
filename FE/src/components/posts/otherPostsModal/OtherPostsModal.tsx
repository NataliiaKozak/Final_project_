//модалка предпросмотра
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../../../redux/slices/commentsSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from './otherModal.module.css';
import { $api } from '../../../api/api';
import commbtn from '../../../assets/comment_btn.svg';
import heart from '../../../assets/heart_btn.svg';
import CommentContent from '../../comments/commentContent/CommentContent';
import type { IPost } from '../../../interfaces/post.interface';

interface ModalProps {
  post: IPost;
  onClose: () => void;
  onUpdatePosts: () => void;
}

const EmojiPicker: React.FC<{ onSelectEmoji: (emoji: string) => void }> = ({
  onSelectEmoji,
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = Array.from({ length: 80 }, (_, i) =>
    String.fromCodePoint(0x1f600 + i)
  );

  const toggleEmojiPicker = () => {
    setShowEmojis((prev) => {
      const next = !prev;
      if (next) setTimeout(() => setShowEmojis(false), 6000);
      return next;
    });
  };

  return (
    <div className={styles.emojiDropdown}>
      <button
        type="button"
        className={styles.emojiButton}
        onClick={toggleEmojiPicker}
      >
        😊
      </button>
      {showEmojis && (
        <div className={styles.emojiList}>
          {emojis.map((emoji, index) => (
            <span
              key={index}
              className={styles.emojiItem}
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);

  // безопасные поля автора (author: string | { ... })
  const authorName =
    typeof post.author === 'string' ? 'User' : post.author?.username ?? 'User';
  const authorImage =
    typeof post.author === 'string'
      ? undefined
      : post.author?.profileImage ?? undefined;

  useEffect(() => {
    setLikesCount(post.likesCount ?? 0);
    setCommentsCount(post.commentsCount ?? 0);
  }, [post]);

  const handleAddComment = async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    const text = newComment.trim();
    if (!text) return;

    try {
      await dispatch(addComment({ postId: post._id, text })).unwrap?.();
      setNewComment('');
      setCommentsCount((prev) => prev + 1); // локальный инкремент
      setError(null);
    } catch {
      setError('Error adding comment');
    }
  };

  const handleLikePost = async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    try {
      // бэк: toggle like
      await $api.post(`/likes/post/${post._id}`);
      setLikesCount((prev) => prev + 1); // простой локальный инкремент
    } catch (err) {
      console.error('Ошибка при лайке поста:', err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await $api.delete(`/posts/${post._id}`);
      onUpdatePosts();
      onClose();
    } catch (err) {
      console.error('Ошибка при удалении поста:', err);
    }
  };

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
                  <img
                    src={authorImage || profilePlaceholder}
                    alt="profile"
                  />
                </span>
              </span>
              <div className={styles.nameCaption}>
                <span className={styles.user_name}>{authorName}</span>
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
                <img src={heart} alt="likes" onClick={handleLikePost} /> {likesCount} Likes
              </span>
            </div>

            <div className={styles.modalContent_rightside_notifications_date}>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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

          <div className={styles.footerActions}>
            <button className={styles.deleteButton} onClick={handleDeletePost}>
              Delete post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;

