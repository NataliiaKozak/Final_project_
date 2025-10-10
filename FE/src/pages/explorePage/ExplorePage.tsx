import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { getAllPublicPosts } from '../../redux/slices/postsSlice';
// import PostModal from '../../components/posts/postModal/PostModal'; //вместо pages/explorePage/ExplorePostModal.tsx
import styles from './ExplorePage.module.css';

import type { PostPreview } from '../../interfaces/post.interface';
import ExplorePostModal from '../../components/search/ExplorePostModal';
import { $api } from 'api/api';

export const Explore: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.posts
  );
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

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error}</div>;

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
              onClick={() =>
                handleImageClick({
                  _id: item._id,
                  image: item.image,
                  createdAt: item.createdAt,
                })
              }
            >
              <img src={item.image} alt="Post image" className={styles.image} />
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
