export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;

  bio?: string;
  profileImage?: string;
  website?: string;

  // виртуальные/агрегированные поля 
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

/** Пейлоад для PUT /users (multipart) */
export type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  profileImageFile?: File | Blob | null; 
};
