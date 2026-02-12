import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { getOtherUserPosts } from '../../../redux/slices/postsSlice';
import PostModal from '../postModal/PostModal';
import styles from './postList2.module.css';

// тип поста берём из стора, чтобы не расходиться с IPost
type PostEntity = RootState['posts']['posts'][number];

const PostsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { otherUserPosts, loading, error } = useSelector((state: RootState) => state.posts);
  const [selectedPost, setSelectedPost] = useState<PostEntity | null>(null);

  useEffect(() => {
    if (authUser?._id) dispatch(getOtherUserPosts(authUser._id));
  }, [dispatch, authUser?._id]);

  const handleImageClick = (post: PostEntity) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  const handleUpdatePosts = () => { if (authUser?._id) dispatch(getOtherUserPosts(authUser._id)); };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className={styles.postList}>
        {otherUserPosts
          ?.slice()
          .reverse()
          .map((post) => (
            <img
              key={post._id}
              src={post.image} // ← в бэке поле image (S3 URL)
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
