//1
export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  website?: string;
  profileImage?: string;
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

export type PublicUser = Pick<
  IUser,
  | '_id'
  | 'username'
  | 'email'
  | 'fullName'
  | 'profileImage'
  | 'followersCount'
  | 'followingCount'
  | 'postsCount'
  | 'isFollowing'
> & { lastMessage?: string };

export type FollowItem = Pick<
  IUser,
  '_id' | 'username' | 'fullName' | 'profileImage'
>;

export interface IMessage {
  _id: string;
  text?: string;
  imageUrl?: string;
  sender: { _id: string; username: string; profileImage?: string };
  recipient: { _id: string; username: string; profileImage?: string };
  createdAt: string;
}

export type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  fullName?: string;
  website?: string;
  profileImageFile?: File | Blob | null; // присылай сюда файл аватарки
};

//2
// Общие фронтовые типы — синхронизированы с твоими моделями/контроллерами

// export interface IUser {
//   _id: string;
//   username: string;
//   email: string;
//   fullName: string;
//   bio?: string;
//   profileImage?: string;
//   website?: string;
//   followersCount?: number;
//   followingCount?: number;
//   postsCount?: number;
//   commentsCount?: number;
//   likesCount?: number;
//   notificationsCount?: number;
//   isFollowing?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// // минимальный профиль, который возвращают /register и /login
// export type AuthUser = Pick<IUser, '_id' | 'username' | 'email' | 'fullName' | 'profileImage'>;

// // публичный профиль на экранах (может включать счётчики и isFollowing)
// export type PublicUser = Pick<
//   IUser,
//   | '_id'
//   | 'username'
//   | 'email'
//   | 'fullName'
//   | 'profileImage'
//   | 'followersCount'
//   | 'followingCount'
//   | 'postsCount'
//   | 'isFollowing'
// > & { lastMessage?: string };

// export type FollowItem = Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>;

// export type UpdateProfilePayload = {
//   username?: string;
//   bio?: string;
//   fullName?: string;
//   website?: string;
//   profileImageFile?: File | Blob | null;
// };
