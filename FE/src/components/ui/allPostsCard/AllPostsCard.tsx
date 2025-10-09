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

// import styles from './allPostCard.module.css';

// import React from 'react';

// interface AllPostsCardProps {
//   image_url: string;
//   caption: string;
//   likes_count: number;
//   comments_count: number;
//   user_name: string;
//   profile_image: string;
//   created_at: string;
// }

// const AllPostsCard: React.FC<AllPostsCardProps> = ({
//   image_url,
//   caption,
//   likes_count,
//   comments_count,
//   user_name,
//   profile_image,
//   created_at,
// }) => {
//   return (
//     <div className="post-card">
//       <div className="post-card-header">
//         <img
//           src={profile_image}
//           alt={`${user_name} profile`}
//           className="profile-image"
//         />
//         <span>{user_name}</span>
//       </div>
//       <img src={image_url} alt="post" className="post-image" />
//       <p>{caption}</p>
//       <div className="post-card-footer">
//         <span>{likes_count} Likes</span>
//         <span>{comments_count} Comments</span>
//         <span>{new Date(created_at).toLocaleDateString()}</span>
//       </div>
//     </div>
//   );
// };

// export default AllPostsCard;
