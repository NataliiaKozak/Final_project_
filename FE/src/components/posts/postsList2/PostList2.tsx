import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getOtherUserPosts } from '../../../redux/slices/postsSlice';
import PostModal from '../postModal/PostModal';
import type { IPost } from '../../../interfaces/post.interface';
import styles from './postList2.module.css';

const PostsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { otherUserPosts, loading, error } = useAppSelector((s) => s.posts);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  useEffect(() => {
    if (authUser?._id) dispatch(getOtherUserPosts(authUser._id));
  }, [dispatch, authUser?._id]);

  const handleImageClick = (post: IPost) => setSelectedPost(post);
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
