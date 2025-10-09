import styles from './allPostCard.module.css';

import React from 'react';

interface AllPostsCardProps {
  image_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  user_name: string;
  profile_image: string;
  created_at: string;
}

const AllPostsCard: React.FC<AllPostsCardProps> = ({
  image_url,
  caption,
  likes_count,
  comments_count,
  user_name,
  profile_image,
  created_at,
}) => {
  return (
    <div className="post-card">
      <div className="post-card-header">
        <img
          src={profile_image}
          alt={`${user_name} profile`}
          className="profile-image"
        />
        <span>{user_name}</span>
      </div>
      <img src={image_url} alt="post" className="post-image" />
      <p>{caption}</p>
      <div className="post-card-footer">
        <span>{likes_count} Likes</span>
        <span>{comments_count} Comments</span>
        <span>{new Date(created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AllPostsCard;
