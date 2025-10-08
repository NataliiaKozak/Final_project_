export interface IPost {
  _id: string;
  description?: string;
  image: string; // S3 URL
  author:
    | string
    | {
        _id: string;
        username: string;
        profileImage?: string;
        fullName?: string;
      };
  likes?: string[];
  comments?: string[];
  likesCount?: number; // виртуал
  commentsCount?: number; // виртуал
  createdAt: string;
  updatedAt: string;
}

// превью для профиля/эксплора
export type PostPreview = Pick<IPost, '_id' | 'image' | 'createdAt'>;
