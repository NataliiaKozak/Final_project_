import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { getAllPublicPosts } from '../../redux/slices/postsSlice';
// import PostModal from '../../components/posts/postModal/PostModal'; //вместо pages/explorePage/ExplorePostModal.tsx
import styles from './ExplorePage.module.css';


import type { PostPreview } from '../../interfaces/post.interface';
import ExplorePostModal from '../../components/search/ExplorePostModal';


export const Explore: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);
  // Используем твой тип превью
  const [selectedPost, setSelectedPost] = useState<PostPreview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllPublicPosts());
  }, [dispatch]);

  const handleImageClick = (post: PostPreview) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <main className={styles.content}>
        <div className={styles.gallery}>
          {posts.map((item, index) => (
            <div
              key={item._id}
              className={
                (Math.floor(index / 3) % 2 === 0 && index % 3 === 4) ||
                (Math.floor(index / 3) % 2 === 1 && index % 3 === 0)
                  ? `${styles.postContainer} ${styles.largePost}`
                  : styles.postContainer
              }
              onClick={() => handleImageClick({ _id: item._id, image: item.image, createdAt: item.createdAt })}
            >
              <img
                src={item.image}
                alt="Post image"
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </main>

      {selectedPost && (
        <ExplorePostModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Explore;

// // точный тип поста из стора (он должен соответствовать твоему IPost)
// type PostEntity = RootState['posts']['posts'][number];

// const Explore: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { posts, loading, error } = useSelector((s: RootState) => s.posts);

//   const [selectedPost, setSelectedPost] = useState<PostEntity | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     dispatch(getAllPublicPosts());
//   }, [dispatch]);

//   const handleImageClick = (post: PostEntity) => {
//     setSelectedPost(post);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedPost(null);
//     setIsModalOpen(false);
//   };

//   if (loading) return <div>Загрузка...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className={styles.pageContainer}>
//       <main className={styles.content}>
//         <div className={styles.gallery}>
//           {posts.map((item, index) => (
//             <div
//               key={item._id}
//               className={
//                 (Math.floor(index / 3) % 2 === 0 && index % 3 === 4) ||
//                 (Math.floor(index / 3) % 2 === 1 && index % 3 === 0)
//                   ? `${styles.postContainer} ${styles.largePost}`
//                   : styles.postContainer
//               }
//               onClick={() => handleImageClick(item)}
//             >
//               <img
//                 src={item.image}
//                 alt={item.description || 'Post image'}
//                 className={styles.image}
//               />
//             </div>
//           ))}
//         </div>
//       </main>

//       {selectedPost && isModalOpen && (
//         <PostModal
//           post={{
//             _id: selectedPost._id,
//             image: selectedPost.image,
//             description: selectedPost.description,
//             createdAt: selectedPost.createdAt,
//             author:
//               typeof selectedPost.author === 'string'
//                 ? selectedPost.author
//                 : {
//                     _id: selectedPost.author._id,
//                     username: selectedPost.author.username,
//                     profileImage: selectedPost.author.profileImage,
//                     fullName: selectedPost.author.fullName,
//                   },
//             likesCount: selectedPost.likesCount,
//             commentsCount: selectedPost.commentsCount,
//           }}
//           onClose={closeModal}
//           onUpdatePosts={() => dispatch(getAllPublicPosts())}
//         />
//       )}
//     </div>
//   );
// };

// export default Explore;

//обновила поля, выше

// import { useEffect, useState } from 'react';
// import { getAllPublicPosts } from '../../redux/slices/postsSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import type { RootState, AppDispatch } from '../../redux/store';
// import { FC } from 'react';
// // import ExplorePostModal from './ExplorePostModal';
// import styles from './ExplorePage.module.css'; // Импорт стилей

// //2 var
// // Берём точный тип поста из стора
// type PostEntity = RootState['posts']['posts'][number];

// const Explore: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { posts, loading, error } = useSelector((s: RootState) => s.posts);

//   const [selectedPost, setSelectedPost] = useState<PostEntity | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     dispatch(getAllPublicPosts());
//   }, [dispatch]);

//   const handleImageClick = (post: PostEntity) => {
//     setSelectedPost(post);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedPost(null);
//     setIsModalOpen(false);
//   };

//   if (loading) return <div>Загрузка...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className={styles.pageContainer}>
//       <main className={styles.content}>
//         <div className={styles.gallery}>
//           {posts.map((item, index) => (
//             <div
//               key={item._id}
//               className={
//                 (Math.floor(index / 3) % 2 === 0 && index % 3 === 4) ||
//                 (Math.floor(index / 3) % 2 === 1 && index % 3 === 0)
//                   ? `${styles.postContainer} ${styles.largePost}`
//                   : styles.postContainer
//               }
//               onClick={() => handleImageClick(item)}
//             >
//               <img
//                 src={item.image_url}
//                 alt={item.caption || 'Post image'}
//                 className={styles.image}
//               />
//             </div>
//           ))}
//         </div>
//       </main>

//       {selectedPost && (
//         <ExplorePostModal post={selectedPost} isOpen={isModalOpen} onClose={closeModal} />
//       )}
//     </div>
//   );
// };

// export default Explore;

// //1 var
// interface Post {
//   _id: string;
//   image_url: string;
//   caption?: string;
// }

// export const Explore: FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { posts, loading, error } = useSelector(
//     (state: RootState) => state.posts,
//   );
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     dispatch(getAllPublicPosts());
//   }, [dispatch]);

//   const handleImageClick = (post: Post) => {
//     setSelectedPost(post);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedPost(null);
//     setIsModalOpen(false);
//   };

//   if (loading) return <div>Загрузка...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className={styles.pageContainer}>
//       <main className={styles.content}>
//         <div className={styles.gallery}>
//           {posts.map((item: Post, index: number) => (
//             <div
//               key={item._id}
//               className={
//                 (Math.floor(index / 3) % 2 === 0 && index % 3 === 4) ||
//                 (Math.floor(index / 3) % 2 === 1 && index % 3 === 0)
//                   ? `${styles.postContainer} ${styles.largePost}`
//                   : styles.postContainer
//               }
//               onClick={() => handleImageClick(item)}
//             >
//               <img
//                 src={item.image_url}
//                 alt={item.caption || 'Post image'}
//                 className={styles.image}
//               />
//             </div>
//           ))}
//         </div>
//       </main>
//       {selectedPost && (
//         <ExplorePostModal
//           post={selectedPost}
//           isOpen={isModalOpen}
//           onClose={closeModal}
//         />
//       )}
//     </div>
//   );
// };

// export default Explore;
