import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { addComment } from '../../../redux/slices/commentsSlice';
import profilePlaceholder from '../../../assets/photo-placeholder.svg';
import { FaEllipsisV } from 'react-icons/fa';
import styles from './postModal.module.css';
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
      <button type="button" className={styles.emojiButton} onClick={toggleEmojiPicker}>
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

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description ?? '');
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null);

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
      await dispatch(addComment({ postId: post._id, text })).unwrap();
      setNewComment('');
      setCommentsCount((p) => p + 1); // локально увеличим
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
      // БЭК: POST /likes/post/:postId — toggle
      await $api.post(`/likes/post/${post._id}`);
      setLikesCount((p) => p + 1);
    } catch (err) {
      console.error('Ошибка при лайке поста:', err);
    }
  };

  const toggleActionMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionMenu((p) => !p);
  };

  const handleDeletePost = async () => {
    try {
      await $api.delete(`/posts/${post._id}`);
      onUpdatePosts();
      onClose();
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // БЭК: PUT /posts/:id с multipart (image?, description?)
      const form = new FormData();
      // если поле описания меняли, отправим (разрешено и пустое как очистка)
      form.append('description', editedDescription ?? '');
      if (editedImageFile) form.append('image', editedImageFile);

      await $api.put(`/posts/${post._id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowEditModal(false);
      onUpdatePosts();
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent_leftside}>
          <img src={post.image || profilePlaceholder} alt="post" />
        </div>

        <div className={styles.modalContent_rightside}>
          <div className={styles.modalContent_rightside_caption}>
            <div className={styles.topBlockTop}>
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
              </div>
            </div>

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
                <span className={styles.modalCaption}>{post.description}</span>
              </div>
            </div>

            <button className={styles.moreOptionsButton} onClick={toggleActionMenu}>
              <FaEllipsisV />
            </button>
          </div>

          {showActionMenu && (
            <div className={styles.actionMenu}>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete
              </button>

              <button
                className={styles.actionButton}
                onClick={() => {
                  setShowEditModal(true);
                  setShowActionMenu(false);
                }}
              >
                Edit
              </button>

              <button className={styles.actionButton} onClick={() => setShowActionMenu(false)}>
                Go to post
              </button>

              <button
                className={styles.actionButton}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy link
              </button>

              <button className={styles.actionButton} onClick={() => setShowActionMenu(false)}>
                Cancel
              </button>
            </div>
          )}

          {showEditModal && (
            <div className={styles.editModal}>
              <div className={styles.editModalContent}>
                <h2>Edit Post</h2>

                <textarea
                  className={styles.editInput}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Edit description"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditedImageFile(e.target.files[0]);
                    }
                  }}
                />
                {editedImageFile && (
                  <img
                    src={URL.createObjectURL(editedImageFile)}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                )}

                <div className={styles.editButtons}>
                  <button className={styles.saveButton} onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirmation && (
            <div className={styles.deleteConfirmation}>
              <p>Are you sure you want to delete this post?</p>
              <div className={styles.delButtons}>
                <button className={styles.confirmDeleteButton} onClick={handleDeletePost}>
                  Yes
                </button>
                <button
                  className={styles.cancelDeleteButton}
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  No
                </button>
              </div>
            </div>
          )}

          <div className={styles.commentsSection}>
            <CommentContent postId={post._id} />
          </div>

          <div>
            <div className={styles.modalContent_rightside_notifications}>
              <span>
                <img src={commbtn} alt="comments" /> {commentsCount}
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
        </div>
      </div>
    </div>
  );
};

export default PostModal;
