import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getOtherUserPosts } from '../../../redux/slices/postsSlice'; 
import type { AppDispatch, RootState } from '../../../redux/store';
import PostModal from '../otherPostsModal/OtherPostsModal';
import styles from './postsListOther.module.css';

// превью из /posts/user/:userId
export type PostPreview = { _id: string; image: string; createdAt: string };
// const [selectedPost, setSelectedPost] = useState<PostPreview | null>(null);

const PostsListOther: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);
  const [selectedPost, setSelectedPost] = useState<PostPreview | null>(null);

  useEffect(() => {
    if (userId) dispatch(getOtherUserPosts(userId));
  }, [dispatch, userId]);

  const handleImageClick = (post: PostPreview) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // posts здесь — это общий список; если ты хранишь все посты в одном массиве,
  // и компонент открывается только на чужом профиле, он отрендерит нужные превью
  return (
    <div className={styles.postlistOther}>
      <div className={styles.postList}>
        {[...posts].reverse().map((post: any) => (
          <img
            key={post._id}
            src={post.image}
            alt="post-thumbnail"
            onClick={() => handleImageClick(post as PostPreview)} // если posts тип шире

            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost} 
          onClose={closeModal}
          onUpdatePosts={() => userId && dispatch(getOtherUserPosts(userId))}
        />
      )}
    </div>
  );
};

export default PostsListOther;

// const PostsListOther: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { userId } = useParams<{ userId: string }>();
//   const { posts, loading, error } = useSelector((s: RootState) => s.posts);
//   const [selectedPost, setSelectedPost] = useState<PostPreview | null>(null);

//   useEffect(() => {
//     if (userId) dispatch(getOtherUserPosts(userId));
//   }, [dispatch, userId]);

//   const handleImageClick = (post: PostPreview) => setSelectedPost(post);
//   const closeModal = () => setSelectedPost(null);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className={styles.posnlistOther}>
//       <div className={styles.postList}>
//         {[...posts].reverse().map((post) => (
//           <img
//             key={post._id}
//             src={post.image}
//             alt="post-thumbnail"
//             onClick={() => handleImageClick(post as PostPreview)}
//             style={{ cursor: 'pointer' }}
//           />
//         ))}
//       </div>

//       {selectedPost && (
//         <PostModal
//           post={selectedPost} // ← без any
//           onClose={closeModal}
//           onUpdatePosts={() => userId && dispatch(getOtherUserPosts(userId))}
//         />
//       )}
//     </div>
//   );
// };

// export default PostsListOther;
