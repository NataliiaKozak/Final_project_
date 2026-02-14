import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../../assets/photo-placeholder.svg';
import { FaEllipsisV, FaHeart } from 'react-icons/fa';
import styles from './postModal.module.css';
import { $api } from '../../../api/api';
import commbtn from '../../../assets/comment_btn.svg';
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

const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description ?? '');
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null);
  const [displayDescription, setDisplayDescription] = useState(post.description ?? '');

  const { id: authorId, name: authorName, image: authorImage } = getAuthorInfo(post.author);
  const isMyPost = authorId === currentUser?._id;

  const { isLiked, likesCount, toggleLike } = useOptimisticLike(
    post._id,
    post.isLikedByMe ?? false,
    post.likesCount ?? 0,
  );

  const { newComment, setNewComment, error, handleAddComment } = useAddComment(
    post._id,
    () => setCommentsCount((p) => p + 1),
  );

  useEffect(() => {
    setCommentsCount(post.commentsCount ?? 0);
  }, [post]);

  const toggleActionMenu = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowActionMenu((p) => !p);
  };

  const handleDeletePost = async (): Promise<void> => {
    try {
      await $api.delete(`/posts/${post._id}`);
      onUpdatePosts();
      onClose();
      setShowDeleteConfirmation(false);
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Delete error:', err.message);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    try {
      const form = new FormData();
      form.append('description', editedDescription ?? '');
      if (editedImageFile) form.append('image', editedImageFile);

      await $api.put(`/posts/${post._id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDisplayDescription(editedDescription);
      setShowEditModal(false);
      onUpdatePosts();
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Save error:', err.message);
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
                  <img src={authorImage || profilePlaceholder} alt="profile" />
                </span>
              </span>
              <div className={styles.nameCaption}>
                <span className={styles.user_name}>{authorName}</span>
              </div>
            </div>

            <div className={styles.topBlock}>
              <span className={styles.gradient_border}>
                <span className={styles.gradient_border_inner}>
                  <img src={authorImage || profilePlaceholder} alt="profile" />
                </span>
              </span>
              <div className={styles.nameCaption}>
                <span className={styles.modalCaption}>{displayDescription}</span>
              </div>
            </div>

            {isMyPost && (
              <button className={styles.moreOptionsButton} onClick={toggleActionMenu}>
                <FaEllipsisV />
              </button>
            )}
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
                onClick={() => { setShowEditModal(true); setShowActionMenu(false); }}
              >
                Edit
              </button>
              <button className={styles.actionButton} onClick={() => { navigate(`/post/${post._id}`); setShowActionMenu(false); }}>
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
                    if (e.target.files?.[0]) setEditedImageFile(e.target.files[0]);
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
                  <button className={styles.saveButton} onClick={handleSaveEdit}>Save</button>
                  <button className={styles.cancelButton} onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirmation && (
            <div className={styles.deleteConfirmation}>
              <p>Are you sure you want to delete this post?</p>
              <div className={styles.delButtons}>
                <button className={styles.confirmDeleteButton} onClick={handleDeletePost}>Yes</button>
                <button className={styles.cancelDeleteButton} onClick={() => setShowDeleteConfirmation(false)}>No</button>
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
                <FaHeart
                  onClick={toggleLike}
                  style={{ cursor: 'pointer', color: isLiked ? 'red' : '#ccc', transition: 'color 0.2s' }}
                  size={18}
                />
                {likesCount} Likes
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

export default PostModal;
