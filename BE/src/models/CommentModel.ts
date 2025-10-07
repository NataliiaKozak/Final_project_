import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId; // Автор комментария
  post: Types.ObjectId; // К какому посту
  text: string;
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  likesCount?: number;
  // author: Types.ObjectId;    // автора поста (для прав доступа)
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    // author: Types.ObjectId // дублировало `user`. Автор комментария = user
  },
  { timestamps: true }
);

CommentSchema.virtual('likesCount').get(function (this: IComment) {
  // return this.likes.length;
  return (this.likes ?? []).length; //для устойчивости к undefined
});

CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // ret.id = String(ret._id);
    delete ret.id; // ← убираем _id
    return ret;
  },
});
CommentSchema.set('toObject', { virtuals: true });

export default mongoose.model<IComment>('Comment', CommentSchema);
