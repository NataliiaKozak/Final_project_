import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  post: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  likesCount?: number;
  author: Types.ObjectId;    // 🔹 добавляем автора поста (для прав доступа)
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    author: Types.ObjectId    // 🔹 добавляем автора поста (для прав доступа)
  },
  { timestamps: true }
);

CommentSchema.virtual("likesCount").get(function (this: IComment) {
  return this.likes.length;
});

CommentSchema.set("toJSON", { virtuals: true });
CommentSchema.set("toObject", { virtuals: true });

export default mongoose.model<IComment>("Comment", CommentSchema);
