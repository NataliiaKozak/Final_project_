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

// Тип поста — совпадает с тем, что отдаёт GET /posts (см. PostList2)
// interface ModalPost {
//   _id: string;
//   image: string;
//   description?: string;
//   createdAt: string;
//   author?: { _id: string; username: string; profileImage?: string };
//   likesCount?: number;
//   commentsCount?: number;
// }

interface ModalPost {
  _id: string;
  image: string; // S3 URL
  description?: string;
  createdAt: string;
  // автор может прийти id-строкой или популянным объектом
  author?:
    | string
    | {
        _id: string;
        username: string;
        profileImage?: string;
        fullName?: string;
      };
  likesCount?: number; // виртуал/агрегат, если вернётся
  commentsCount?: number; // виртуал/агрегат, если вернётся
}

interface ModalProps {
  post: ModalPost;
  onClose: () => void;
  onUpdatePosts: () => void;
}
const EmojiPicker: React.FC<{ onSelectEmoji: (emoji: string) => void }> = ({ onSelectEmoji }) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = Array.from({ length: 80 }, (_, i) => String.fromCodePoint(0x1f600 + i));

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
          {emojis.map((emoji, idx) => (
            <span key={idx} className={styles.emojiItem} onClick={() => onSelectEmoji(emoji)}>
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
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description ?? '');
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null); // файл для PUT

  // безопасный объект автора для JSX
  const authorObj =
    typeof post.author === 'object' && post.author !== null ? post.author : undefined;

  useEffect(() => {
    setLikesCount(post.likesCount ?? 0);
    setCommentsCount(post.commentsCount ?? 0);
  }, [post]);

  const handleAddComment = async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    try {
      // БЭК: POST /comments/:postId  body: { text }
      await dispatch(addComment({ postId: post._id, text: newComment.trim() })).unwrap();
      setNewComment('');
      setCommentsCount((p) => p + 1); // локально увеличим счётчик
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
      // БЭК: POST /likes/post/:postId — toggle лайка
      await $api.post(`/likes/post/${post._id}`);
      setLikesCount((p) => p + 1); // простой локальный инкремент
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
      // БЭК: DELETE /posts/:id
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
      // БЭК: PUT /posts/:id (multipart: image?, description?)
      const form = new FormData();
      if (editedDescription !== undefined) form.append('description', editedDescription);
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
                    src={authorObj?.profileImage || profilePlaceholder}
                    alt="profile"
                  />
                </span>
              </span>
              <div className={styles.nameCaption}>
                <span className={styles.user_name}>{authorObj?.username || 'User'}</span>
              </div>
            </div>

            <div className={styles.topBlock}>
              <span className={styles.gradient_border}>
                <span className={styles.gradient_border_inner}>
                  <img
                    src={authorObj?.profileImage || profilePlaceholder}
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
                <img src={commbtn} alt="" /> {commentsCount}
              </span>
              <span>
                <img src={heart} alt="" onClick={handleLikePost} /> {likesCount} Likes
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

//ругался Ошибка типов в PostList2
// const EmojiPicker: React.FC<{ onSelectEmoji: (emoji: string) => void }> = ({
//   onSelectEmoji,
// }) => {
//   const [showEmojis, setShowEmojis] = useState(false);
//   const emojis = Array.from({ length: 80 }, (_, i) =>
//     String.fromCodePoint(0x1f600 + i)
//   );

//   const toggleEmojiPicker = () => {
//     setShowEmojis((prev) => {
//       const next = !prev;
//       if (next) setTimeout(() => setShowEmojis(false), 6000);
//       return next;
//     });
//   };

//   return (
//     <div className={styles.emojiDropdown}>
//       <button
//         type="button"
//         className={styles.emojiButton}
//         onClick={toggleEmojiPicker}
//       >
//         😊
//       </button>
//       {showEmojis && (
//         <div className={styles.emojiList}>
//           {emojis.map((emoji, idx) => (
//             <span
//               key={idx}
//               className={styles.emojiItem}
//               onClick={() => onSelectEmoji(emoji)}
//             >
//               {emoji}
//             </span>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const currentUser = useSelector((s: RootState) => s.auth.user);

//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const [showActionMenu, setShowActionMenu] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
//   const [commentsCount, setCommentsCount] = useState<number>(
//     post.commentsCount ?? 0
//   );

//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editedDescription, setEditedDescription] = useState(
//     post.description ?? ''
//   );
//   const [editedImageFile, setEditedImageFile] = useState<File | null>(null); // файл для PUT

//   // безопасный объект автора для JSX
//   const authorObj =
//     typeof post.author === 'object' && post.author !== null ? post.author : undefined;
//   useEffect(() => {
//     setLikesCount(post.likesCount ?? 0);
//     setCommentsCount(post.commentsCount ?? 0);
//   }, [post]);

//   const handleAddComment = async () => {
//     if (!currentUser?._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       await dispatch(
//         addComment({ postId: post._id, text: newComment.trim() })
//       ).unwrap();
//       setNewComment('');
//       setCommentsCount((p) => p + 1); // локально
//     } catch {
//       setError('Error adding comment');
//     }
//   };

//   const handleLikePost = async () => {
//     if (!currentUser?._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       // БЭК: POST /likes/post/:postId — toggle
//       await $api.post(`/likes/post/${post._id}`);
//       setLikesCount((p) => p + 1); // простой локальный инкремент
//     } catch (err) {
//       console.error('Ошибка при лайке поста:', err);
//     }
//   };

//   const toggleActionMenu = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setShowActionMenu((p) => !p);
//   };

//   const handleDeletePost = async () => {
//     try {
//       await $api.delete(`/posts/${post._id}`);
//       onUpdatePosts();
//       onClose();
//       setShowDeleteConfirmation(false);
//     } catch (error) {
//       console.error('Ошибка при удалении поста:', error);
//     }
//   };

//   const handleSaveEdit = async () => {
//     try {
//       // БЭК: PUT /posts/:id с multipart (image?, description?)
//       const form = new FormData();
//       if (editedDescription !== undefined)
//         form.append('description', editedDescription);
//       if (editedImageFile) form.append('image', editedImageFile);

//       await $api.put(`/posts/${post._id}`, form, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setShowEditModal(false);
//       onUpdatePosts();
//     } catch (error) {
//       console.error('Ошибка при сохранении изменений:', error);
//     }
//   };

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.modalContent_leftside}>
//           <img src={post.image || profilePlaceholder} alt="post" />
//         </div>

//         <div className={styles.modalContent_rightside}>
//           <div className={styles.modalContent_rightside_caption}>
//             <div className={styles.topBlockTop}>
//               <span className={styles.gradient_border}>
//                 <span className={styles.gradient_border_inner}>
//                   <img
//                     src={post.author?.profileImage || profilePlaceholder}
//                     alt="profile"
//                   />
//                 </span>
//               </span>
//               <div className={styles.nameCaption}>
//                 <span className={styles.user_name}>
//                   {post.author?.username || 'User'}
//                 </span>
//               </div>
//             </div>

//             <div className={styles.topBlock}>
//               <span className={styles.gradient_border}>
//                 <span className={styles.gradient_border_inner}>
//                   <img
//                     src={post.author?.profileImage || profilePlaceholder}
//                     alt="profile"
//                   />
//                 </span>
//               </span>
//               <div className={styles.nameCaption}>
//                 <span className={styles.modalCaption}>{post.description}</span>
//               </div>
//             </div>

//             <button
//               className={styles.moreOptionsButton}
//               onClick={toggleActionMenu}
//             >
//               <FaEllipsisV />
//             </button>
//           </div>

//           {showActionMenu && (
//             <div className={styles.actionMenu}>
//               <button
//                 className={`${styles.actionButton} ${styles.deleteButton}`}
//                 onClick={() => setShowDeleteConfirmation(true)}
//               >
//                 Delete
//               </button>

//               <button
//                 className={styles.actionButton}
//                 onClick={() => {
//                   setShowEditModal(true);
//                   setShowActionMenu(false);
//                 }}
//               >
//                 Edit
//               </button>

//               <button
//                 className={styles.actionButton}
//                 onClick={() => setShowActionMenu(false)}
//               >
//                 Go to post
//               </button>

//               <button
//                 className={styles.actionButton}
//                 onClick={() => {
//                   navigator.clipboard.writeText(
//                     `${window.location.origin}/post/${post._id}`
//                   );
//                   alert('Link copied to clipboard!');
//                 }}
//               >
//                 Copy link
//               </button>

//               <button
//                 className={styles.actionButton}
//                 onClick={() => setShowActionMenu(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {showEditModal && (
//             <div className={styles.editModal}>
//               <div className={styles.editModalContent}>
//                 <h2>Edit Post</h2>

//                 <textarea
//                   className={styles.editInput}
//                   value={editedDescription}
//                   onChange={(e) => setEditedDescription(e.target.value)}
//                   placeholder="Edit description"
//                 />

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     if (e.target.files && e.target.files[0]) {
//                       setEditedImageFile(e.target.files[0]);
//                     }
//                   }}
//                 />

//                 <div className={styles.editButtons}>
//                   <button
//                     className={styles.saveButton}
//                     onClick={handleSaveEdit}
//                   >
//                     Save
//                   </button>
//                   <button
//                     className={styles.cancelButton}
//                     onClick={() => setShowEditModal(false)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {showDeleteConfirmation && (
//             <div className={styles.deleteConfirmation}>
//               <p>Are you sure you want to delete this post?</p>
//               <div className={styles.delButtons}>
//                 <button
//                   className={styles.confirmDeleteButton}
//                   onClick={handleDeletePost}
//                 >
//                   Yes
//                 </button>
//                 <button
//                   className={styles.cancelDeleteButton}
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 >
//                   No
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className={styles.commentsSection}>
//             <CommentContent postId={post._id} />
//           </div>

//           <div>
//             <div className={styles.modalContent_rightside_notifications}>
//               <span>
//                 <img src={commbtn} alt="" /> {commentsCount}
//               </span>
//               <span>
//                 <img src={heart} alt="" onClick={handleLikePost} /> {likesCount}{' '}
//                 Likes
//               </span>
//             </div>
//             <div className={styles.modalContent_rightside_notifications_date}>
//               <span>{new Date(post.createdAt).toLocaleDateString()}</span>
//             </div>

//             <div className={styles.addCommentSection}>
//               <EmojiPicker
//                 onSelectEmoji={(emoji) => setNewComment((p) => p + emoji)}
//               />
//               <input
//                 type="text"
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Add a comment..."
//                 className={styles.commentInput}
//               />
//               <button
//                 onClick={handleAddComment}
//                 disabled={!newComment.trim()}
//                 className={styles.commentButton}
//               >
//                 Submit
//               </button>
//             </div>

//             {error && <p className={styles.errorText}>{error}</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PostModal;

// // МИНИМАЛЬНО: принимаем полноценный IPost из стора
// interface ModalProps {
//   post: IPost;
//   onClose: () => void;
//   onUpdatePosts: () => void;
// }

//предложение отличается от предыдущей версии
// const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const currentUser = useSelector((s: RootState) => s.auth.user);

//   // маппим поля под твой бэк
//   const author = typeof post.author === 'string' ? null : post.author;
//   const caption = post.description ?? '';            // у тебя description
//   const imageUrl = post.image;                       // у тебя image
//   const createdAt = post.createdAt;                  // timestamps
//   const initialLikes = post.likesCount ?? 0;         // виртуал
//   const initialComments = post.commentsCount ?? 0;   // виртуал

//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [likesCount, setLikesCount] = useState<number>(initialLikes);
//   const [commentsCount, setCommentsCount] = useState<number>(initialComments);

//   useEffect(() => {
//     setLikesCount(post.likesCount ?? 0);
//     setCommentsCount(post.commentsCount ?? 0);
//   }, [post]);

//   const handleAddComment = async () => {
//     if (!currentUser?._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       await dispatch(
//         addComment({ postId: post._id, text: newComment.trim() })
//       ).unwrap();
//       setNewComment('');
//       setCommentsCount((p) => p + 1); // локально
//     } catch {
//       setError('Error adding comment');
//     }
//   };

//   const handleLikePost = async () => {
//     if (!currentUser?._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       // БЭК: POST /likes/post/:postId (toggle)
//       await $api.post(`/likes/post/${post._id}`);
//       setLikesCount((p) => p + 1); // простой локальный инкремент
//     } catch (err) {
//       console.error('Ошибка при лайке поста:', err);
//     }
//   };

//   const handleDeletePost = async () => {
//     try {
//       await $api.delete(`/posts/${post._id}`); // БЭК: DELETE /posts/:id
//       onUpdatePosts();
//       onClose();
//     } catch (error) {
//       console.error('Ошибка при удалении поста:', error);
//     }
//   };

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.modalContent_leftside}>
//           <img src={imageUrl || profilePlaceholder} alt="post" />
//         </div>

//         <div className={styles.modalContent_rightside}>
//           <div className={styles.modalContent_rightside_caption}>
//             <div className={styles.topBlockTop}>
//               <span className={styles.gradient_border}>
//                 <span className={styles.gradient_border_inner}>
//                   <img
//                     src={author?.profileImage || profilePlaceholder}
//                     alt="profile"
//                   />
//                 </span>
//               </span>
//               <div className={styles.nameCaption}>
//                 <span className={styles.user_name}>{author?.username ?? ''}</span>
//               </div>
//             </div>

//             <div className={styles.topBlock}>
//               <div className={styles.nameCaption}>
//                 <span className={styles.modalCaption}>{caption}</span>
//               </div>
//             </div>
//           </div>

//           <div className={styles.commentsSection}>
//             <CommentContent postId={post._id} />
//           </div>

//           <div>
//             <div className={styles.modalContent_rightside_notifications}>
//               <span>
//                 <img src={commbtn} alt="" /> {commentsCount}
//               </span>
//               <span>
//                 <img src={heart} alt="" onClick={handleLikePost} /> {likesCount} Likes
//               </span>
//             </div>
//             <div className={styles.modalContent_rightside_notifications_date}>
//               <span>{new Date(createdAt).toLocaleDateString()}</span>
//             </div>

//             <div className={styles.addCommentSection}>
//               <input
//                 type="text"
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Add a comment..."
//                 className={styles.commentInput}
//               />
//               <button
//                 onClick={handleAddComment}
//                 disabled={!newComment.trim()}
//                 className={styles.commentButton}
//               >
//                 Submit
//               </button>
//             </div>
//             {error && <p className={styles.errorText}>{error}</p>}
//           </div>

//           {/* при желании вернёшь сюда меню редактирования/удаления */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PostModal;

// interface ModalProps {
//   post: Post;
//   onClose: () => void;
//   onUpdatePosts: () => void;
// }

// const EmojiPicker: React.FC<{ onSelectEmoji: (emoji: string) => void }> = ({
//   onSelectEmoji,
// }) => {
//   const [showEmojis, setShowEmojis] = useState(false);

//   const emojis = Array.from({ length: 80 }, (_, i) =>
//     String.fromCodePoint(0x1f600 + i),
//   );

//   const toggleEmojiPicker = () => {
//     setShowEmojis(prev => {
//       const newState = !prev;
//       if (newState) {
//         setTimeout(() => {
//           setShowEmojis(false);
//         }, 6000);
//       }
//       return newState;
//     });
//   };

//   return (
//     <div className={styles.emojiDropdown}>
//       <button
//         type="button"
//         className={styles.emojiButton}
//         onClick={toggleEmojiPicker}
//       >
//         😊
//       </button>
//       {showEmojis && (
//         <div className={styles.emojiList}>
//           {emojis.map((emoji, index) => (
//             <span
//               key={index}
//               className={styles.emojiItem}
//               onClick={() => onSelectEmoji(emoji)}
//             >
//               {emoji}
//             </span>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [showActionMenu, setShowActionMenu] = useState(false);
//   const [likesCount, setLikesCount] = useState(post.likes_count || 0);
//   const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editedCaption, setEditedCaption] = useState(post.caption); // Редактируемый caption
//   const [editedImage, setEditedImage] = useState(post.image_url); // Редактируемое изображение

//   useEffect(() => {
//     setLikesCount(post.likes_count || 0);
//     setCommentsCount(post.comments_count || 0);
//   }, [post]);

//   const handleAddComment = async () => {
//     if (!currentUser || !currentUser._id) {
//       setError(t('postModal.errorUserNotFound'));
//       return;
//     }

//     try {
//       await dispatch(
//         addComment({
//           postId: post._id,
//           userId: currentUser._id,
//           comment_text: newComment.trim(),
//         }),
//       );
//       setNewComment('');
//       setCommentsCount(prev => prev + 1);
//     } catch (err) {
//       setError(t('postModal.errorAddComment'));
//     }
//   };

//   const handleLikePost = async () => {
//     if (!currentUser || !currentUser._id) {
//       setError(t('postModal.errorUserNotFound'));
//       return;
//     }

//     try {
//       await $api.post(`/post/${post._id}/like`, { userId: currentUser._id });
//       setLikesCount(prev => prev + 1);
//     } catch (err) {
//       console.error('Ошибка при лайке поста:', err);
//     }
//   };

//   const toggleActionMenu = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setShowActionMenu(!showActionMenu);
//   };

//   const handleDeletePost = async () => {
//     try {
//       await $api.delete(`/post/${post._id}`);
//       onUpdatePosts(); // Обновляем список постов
//       onClose(); // Закрываем модальное окно поста
//       setShowDeleteConfirmation(false); // Закрываем окно подтверждения
//     } catch (error) {
//       console.error('Ошибка при удалении поста:', error);
//     }
//   };

//
