import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import {AppDispatch, RootState } from '../../../redux/store';
import { fetchComments, likeComment } from '../../../redux/slices/commentsSlice';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from './commentContent.module.css';
import parseData from '../../../helpers/parseData';
import type { IComment } from '../../../interfaces/comment.interface';


// interface CommentContentProps {
//   postId: string;
// }

// export const CommentContent: React.FC<CommentContentProps> = ({ postId }) => {
//   const dispatch = useDispatch();
//   const comments = useSelector((state: RootState) => state.comments.comments);
//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const loading = useSelector((state: RootState) => state.comments.loading);

//   const dispatch = useDispatch<AppDispatch>();
//   useEffect(() => {
//     dispatch(fetchComments(postId));
//   }, [dispatch, postId]);

//   const handleLikeComment = async (commentId: string) => {
//     if (!currentUser || !currentUser._id) return;
//     try {
//       await dispatch(likeComment({ commentId })).unwrap();
//       dispatch(fetchComments(postId));
//     } catch (err) {
//       console.error('Ошибка при лайке комментария:', err);
//     }
//   };

//   if (loading) return <p>Loading comments...</p>;

//   return (
//     <div className={styles.commentsSection}>
//       {comments.map((comment) => (
//         <div key={comment._id} className={styles.comment}>
//           <img
//             src={comment.user?.profileImage || profilePlaceholder}
//             alt="comment-avatar"
//             className={styles.commentAvatar}
//           />
//           <div className={styles.commentContent}>
//             <p>
//               <strong>{comment.user?.username || 'Anonymous'}</strong>
//               {' · '}
//               {parseData(comment.createdAt)}
//             </p>
//             <p>{comment.text}</p>
//           </div>
//           <div className={styles.commentActions}>
//             <FaHeart
//               className={styles.likeIcon}
//               onClick={() => handleLikeComment(comment._id)}
//               title="Like"
//             />
//             {/* если понадобится число лайков — можно показать comment.likesCount ?? 0 */}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CommentContent;
interface CommentContentProps {
  postId: string;
}

const isPopulatedUser = (
  u: IComment['user']
): u is { _id: string; username: string; profileImage?: string } =>
  typeof u !== 'string';

const CommentContent: React.FC<CommentContentProps> = ({ postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const comments = useSelector((s: RootState) => s.comments.comments);
  const loading = useSelector((s: RootState) => s.comments.loading);

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
        return (
          <div key={comment._id} className={styles.comment}>
            <img
              src={u?.profileImage || profilePlaceholder}
              alt="comment-avatar"
              className={styles.commentAvatar}
            />
            <div className={styles.commentContent}>
              <p>
                <strong>{u?.username || 'Anonymous'}</strong>
                {' · '}
                {parseData(comment.createdAt)}
              </p>
              <p>{comment.text}</p>
            </div>
            <div className={styles.commentActions}>
              <FaHeart
                className={styles.likeIcon}
                onClick={() => handleLikeComment(comment._id)}
                title="Like"
              />
              {/* если бэк сериализует виртуал:
              <span className={styles.likeCount}>{comment.likesCount ?? 0}</span>
              */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentContent;