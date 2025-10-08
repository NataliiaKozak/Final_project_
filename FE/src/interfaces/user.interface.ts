export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  profileImage?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  commentsCount?: number;
  likesCount?: number;
  notificationsCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
