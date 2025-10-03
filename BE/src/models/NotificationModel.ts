import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "liked_post"
  | "liked_comment"
  | "commented_post"
  | "followed_user";

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId; // получатель уведомления
  sender: Types.ObjectId; // кто создал уведомление
  type: NotificationType;
  post?: Types.ObjectId; // опционально: если уведомление связано с постом
  comment?: Types.ObjectId; // опционально: если связано с комментарием
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: ["liked_post", "liked_comment", "commented_post", "followed_user"],
    },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);