import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getOtherUserPosts } from '../../../redux/slices/postsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import PostModal from '../otherPostsModal/OtherPostsModal';
import styles from './postsListOther.module.css';
import type { IPost } from '../../../interfaces/post.interface';

const PostsListOther: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams<{ userId: string }>();
  const { otherUserPosts, loading, error } = useAppSelector((s) => s.posts);

  const [selectedPost, setSelectedPost] = useState<IPost | null>(null); 

  useEffect(() => {
    if (userId) dispatch(getOtherUserPosts(userId));
  }, [dispatch, userId]);

  const handleImageClick = (post: IPost) => setSelectedPost(post); 
  const closeModal = () => setSelectedPost(null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.postlistOther}>
      <div className={styles.postList}>
        {[...otherUserPosts].reverse().map((post) => ( 
          <img
            key={post._id}
            src={post.image}
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
          onUpdatePosts={() => userId && dispatch(getOtherUserPosts(userId))}
        />
      )}
    </div>
  );
};

export default PostsListOther;

