export interface ICommentUser {
  _id: string;
  username: string;
  profileImage?: string;
}

export interface IComment {
  _id: string;
  user: ICommentUser;        // не строка, а объект (популяция)
  post: string;              // id поста
  text: string;
  likes?: string[];          // массив userId, кто лайкнул
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
}