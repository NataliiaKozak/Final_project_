export type NotificationType =
  | 'liked_post'
  | 'liked_comment'
  | 'commented_post'
  | 'followed_user';

export interface Notification {
  _id: string;

  // в контроллере getNotifications user не популятся — оставим строку
  user: string;

  // sender, post, comment — популятся в контроллере
  sender:
    | string
    | {
        _id: string;
        username: string;
        profileImage?: string;
      };

  type: NotificationType;

  post?:
    | string
    | {
        _id: string;
        image: string;
        description?: string;
      };

  comment?:
    | string
    | {
        _id: string;
        text: string;
      };

  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
