import { useEffect, useState } from 'react';
import { getAllPublicPosts } from '../../redux/slices/postsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { FC } from 'react';
import ExplorePostModal from './ExplorePostModal';
import styles from './ExplorePage.module.css'; // Импорт стилей

interface Post {
  _id: string;
  image_url: string;
  caption?: string;
}

export const Explore: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.posts,
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllPublicPosts());
  }, [dispatch]);

  const handleImageClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <main className={styles.content}>
        <div className={styles.gallery}>
          {posts.map((item: Post, index: number) => (
            <div
              key={item._id}
              className={
                (Math.floor(index / 3) % 2 === 0 && index % 3 === 4) ||
                (Math.floor(index / 3) % 2 === 1 && index % 3 === 0)
                  ? `${styles.postContainer} ${styles.largePost}`
                  : styles.postContainer
              }
              onClick={() => handleImageClick(item)}
            >
              <img
                src={item.image_url}
                alt={item.caption || 'Post image'}
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
