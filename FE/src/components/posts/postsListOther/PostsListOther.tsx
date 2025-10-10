import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getOtherUserPosts } from '../../../redux/slices/postsSlice'; 
import type { AppDispatch, RootState } from '../../../redux/store';
import PostModal from '../otherPostsModal/OtherPostsModal';
import styles from './postsListOther.module.css';


import type { IPost } from '../../../interfaces/post.interface'; 

// превью из /posts/user/:userId
export type PostPreview = { _id: string; image: string; createdAt: string };

const PostsListOther: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);

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
        {[...posts].reverse().map((post: IPost) => ( 
          <img
            key={post._id}
            src={post.image}
            alt="post-thumbnail"
            onClick={() => handleImageClick(post as IPost)} 
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

