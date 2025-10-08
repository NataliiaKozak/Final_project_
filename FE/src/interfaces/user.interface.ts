export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  website?: string;
  profileImage?: string;

  // агрегаты/виртуалы с /api/users/:id
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
export type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  // файл для аватарки, уйдёт как FormData под ключом 'profileImage'
  profileImageFile?: File | Blob | null;
};
