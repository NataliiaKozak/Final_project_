import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { getAllPosts } from '../../../redux/slices/postsSlice';
import PostModal from '../postModal/PostModal';
import styles from './postList2.module.css';

// тип поста берём из стора, чтобы не расходиться с IPost
type PostEntity = RootState['posts']['posts'][number];

const PostsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);
  const [selectedPost, setSelectedPost] = useState<PostEntity | null>(null);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  const handleImageClick = (post: PostEntity) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  const handleUpdatePosts = () => dispatch(getAllPosts());

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className={styles.postList}>
        {posts
          ?.slice()
          .reverse()
          .map((post) => (
            <img
              key={post._id}
              src={post.image} // ← в твоём бэке поле image (S3 URL)
              alt="post-thumbnail"
              onClick={() => handleImageClick(post)}
              style={{ cursor: 'pointer' }}
            />
          ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={closeModal}
          onUpdatePosts={handleUpdatePosts}
        />
      )}
    </div>
  );
};

export default PostsList;
