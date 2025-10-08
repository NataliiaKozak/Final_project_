export interface IComment {
  _id: string;
  // в getPostComments и addComment комментарий популятся по user → может прийти id-строкой или объектом
  user:
    | string
    | {
        _id: string;
        username: string;
        profileImage?: string;
      };
  post: string;          // postId
  text: string;          // тело комментария
  likes?: string[];      // массив userId, если вернётся
  likesCount?: number;   // виртуал из модели (если сериализуется)
  createdAt: string;     // timestamps → ISO-строка
  updatedAt: string;     // timestamps → ISO-строка
}