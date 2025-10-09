//модалка предпросмотра
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addComment } from '../../../redux/slices/commentsSlice';
// import { RootState } from '../../../redux/store';
// import profilePlaceholder from '../../../assets/profile-placeholder.svg';
// import styles from './otherModal.module.css';
// import { $api } from '../../../api/api';
// import commbtn from '../../../assets/comment_btn.svg';
// import heart from '../../../assets/heart_btn.svg';
// import CommentContent from '../../comments/commentContent/CommentContent';

// type Post = {
//   _id: string;
//   image: string;
//   createdAt: string;
//   // если нужен caption/author — дополни по месту, но в превью их нет
// };

// interface ModalProps {
//   post: PostPreview;
//   onClose: () => void;
//   onUpdatePosts: () => void;
// }

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
//   const dispatch = useDispatch();
//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [likesCount, setLikesCount] = useState<number>(0);
//   const [commentsCount, setCommentsCount] = useState<number>(0);

//   useEffect(() => {
//     setLikesCount(0); // подтян детально пост: GET /posts/:id
//     setCommentsCount(0);
//   }, [post]);

//   const handleAddComment = async () => {
//     if (!currentUser || !currentUser._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       await dispatch(
//         addComment({ postId: post._id, text: newComment.trim() }) as any
//       );
//       setNewComment('');
//       setCommentsCount((prev) => prev + 1); // локально
//     } catch {
//       setError('Error adding comment');
//     }
//   };

//   const handleLikePost = async () => {
//     if (!currentUser || !currentUser._id) {
//       setError('User not found');
//       return;
//     }
//     try {
//       // БЭК: POST /likes/post/:postId  (toggle)
//       await $api.post(`/likes/post/${post._id}`);
//       setLikesCount((prev) => prev + 1); // простая локальная прибавка
//     } catch (err) {
//       console.error('Ошибка при лайке поста:', err);
//     }
//   };

//   const handleDeletePost = async () => {
//     try {
//       await $api.delete(`/posts/${post._id}`);
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
//           <img src={post.image || profilePlaceholder} alt="post" />
//         </div>
//         <div className={styles.modalContent_rightside}>
//           <button className={styles.closeButton} onClick={onClose}>
//             ✖
//           </button>

//           <div className={styles.commentsSection}>
//             <CommentContent postId={post._id} />
//           </div>

//           <div>
//             <div className={styles.modalContent_rightside_notifications}>
//               <span>
//                 <img src={commbtn} alt="comment-btn" /> {commentsCount}
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
//                 onSelectEmoji={(emoji) => setNewComment((prev) => prev + emoji)}
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

// import type { PostPreview } from '../postsListOther/PostsListOther';

// interface ModalProps {
//   post: PostPreview;
//   onClose: () => void;
//   onUpdatePosts: () => void;
// }

type PostPreview = { _id: string; image: string; createdAt: string };

interface ModalProps {
  post: PostPreview;
  onClose: () => void;
  onUpdatePosts: () => void;
}

const PostModal: React.FC<ModalProps> = ({ post, onClose, onUpdatePosts }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);

  useEffect(() => {
    // базовый вариант — локальные счётчики. превью без счётчиков → локальные
    setLikesCount(0);
    setCommentsCount(0);
    // если точные, то можно подтянуть детальную карточку:
    // GET /posts/:id → и выставить likesCount/commentsCount из ответа.
  }, [post]);

  const handleAddComment = async () => {
    if (!currentUser?._id) {
      setError('User not found');
      return;
    }
    try {
      await dispatch(
        addComment({ postId: post._id, text: newComment.trim() })
      ).unwrap(); // unwrap даст тип IComment, ошибок "unknown" не будет
      setNewComment('');
      setCommentsCount((p) => p + 1); // локально
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
      // БЭК: POST /likes/post/:postId (toggle)
      await $api.post(`/likes/post/${post._id}`);
      setLikesCount((p) => p + 1); // простой локальный инкремент
    } catch (err) {
      console.error('Ошибка при лайке поста:', err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await $api.delete(`/posts/${post._id}`);
      onUpdatePosts();
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
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

          <div className={styles.commentsSection}>
            <CommentContent postId={post._id} />
          </div>

          <div>
            <div className={styles.modalContent_rightside_notifications}>
              <span>
                <img src={commbtn} alt="comment-btn" /> {commentsCount}
              </span>
              <span>
                <img src={heart} alt="" onClick={handleLikePost} /> {likesCount}{' '}
                Likes
              </span>
            </div>
            <div className={styles.modalContent_rightside_notifications_date}>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <div className={styles.addCommentSection}>
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
