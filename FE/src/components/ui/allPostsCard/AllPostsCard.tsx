import React from 'react';
import type { IPost } from '../../../interfaces/post.interface';

type AllPostsCardProps = Pick<
  IPost,
  'image' | 'description' | 'likesCount' | 'commentsCount' | 'author' | 'createdAt'
>;

const AllPostsCard: React.FC<AllPostsCardProps> = ({
  image,
  description,
  likesCount,
  commentsCount,
  author,
  createdAt,
}) => {
  const userName =
    typeof author === 'string' ? '' : author?.username ?? '';

  const profileImage =
    typeof author === 'string' ? '' : author?.profileImage ?? '';

  return (
    <div className="post-card">
      <div className="post-card-header">
        {profileImage ? (
          <img
            src={profileImage}
            alt={userName ? `${userName} profile` : 'profile'}
            className="profile-image"
          />
        ) : null}
        <span>{userName}</span>
      </div>

      <img src={image} alt="post" className="post-image" />

      {description ? <p>{description}</p> : null}

      <div className="post-card-footer">
        <span>{likesCount ?? 0} Likes</span>
        <span>{commentsCount ?? 0} Comments</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AllPostsCard;

