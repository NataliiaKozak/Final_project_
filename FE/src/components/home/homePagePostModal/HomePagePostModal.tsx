import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, fetchComments } from '../../../redux/slices/commentsSlice';
import { RootState, AppDispatch } from '../../../redux/store';
import { $api } from '../../../api/api';
import styles from './HomePagePostModal.module.css';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import commbtn from '../../../assets/comment_btn.svg';
import heart from '../../../assets/heart_btn.svg';
import CommentContent from '../../comments/commentContent/CommentContent';
import type { IPost, PostPreview } from '../../../interfaces/post.interface';

type ModalPost = IPost | PostPreview;

interface ModalProps {
  post: ModalPost;
  onClose: () => void;
}

const EmojiPicker: React.FC<{ onSelectEmoji: (emoji: string) => void }> = ({
  onSelectEmoji,
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ['😊', '😂', '😍', '😢', '👍', '🔥', '💯', '👏', '🤔', '😎'];

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
          {emojis.map((emoji, i) => (
            <span
              key={i}
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

const HomePagePostModal: React.FC<ModalProps> = ({ post, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(
    'likesCount' in post && typeof post.likesCount === 'number'
      ? post.likesCount
      : 0
  );
  const [commentsCount, setCommentsCount] = useState<number>(
    'commentsCount' in post && typeof post.commentsCount === 'number'
      ? post.commentsCount
      : 0
  );

  useEffect(() => {
    dispatch(fetchComments(post._id));
    setLikesCount(
      'likesCount' in post && typeof post.likesCount === 'number'
        ? post.likesCount
        : 0
    );
    setCommentsCount(
      'commentsCount' in post && typeof post.commentsCount === 'number'
        ? post.commentsCount
        : 0
    );

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [dispatch, post, onClose]);

  const handleAddComment = useCallback(async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    try {
      await dispatch(
        addComment({ postId: post._id, text: newComment.trim() })
      ).unwrap();
      setNewComment('');
      setError(null);
      setCommentsCount((p) => p + 1);
    } catch {
      setError('Error adding comment');
    }
  }, [dispatch, currentUser, newComment, post._id]);

  const handleLikePost = useCallback(async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    try {
      //  бэк: toggle
      await $api.post(`/likes/post/${post._id}`);
      setLikesCount((p) => p + 1); // локально увеличиваем
    } catch (err) {
      console.error('Ошибка при лайке поста:', err);
    }
  }, [currentUser, post._id]);

  // Автор 
  const authorUsername =
    'author' in post
      ? typeof post.author === 'string'
        ? 'User'
        : post.author?.username ?? 'User'
      : 'User';
  const authorImage =
    'author' in post
      ? typeof post.author === 'string'
        ? undefined
        : post.author?.profileImage
      : undefined;

  const description = 'description' in post ? post.description : undefined;

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
                <span className={styles.user_name}>{authorUsername}</span>
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
                  <img
                    src={commbtn}
                    className={styles.commentIcon}
                    alt="comment-button"
                  />
                  {commentsCount}
                </span>
                <span>
                  <button className={styles.likeIcon} onClick={handleLikePost}>
                    <img src={heart} alt="likes-button" />
                  </button>
                  {likesCount}
                </span>
              </div>
              <div className={styles.modalContent_rightside_notifications_date}>
                <span>
                  {'createdAt' in post
                    ? new Date(post.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </div>
            </div>

            <div className={styles.addCommentSection}>
              <EmojiPicker
                onSelectEmoji={(emoji) => setNewComment((p) => p + emoji)}
              />
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
