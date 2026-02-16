import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId; // Автор комментария
  post: Types.ObjectId; // К какому посту
  text: string;
  // likes[] — dual source with Like collection. Counts use Like.countDocuments().
  // This array is maintained via $addToSet/$pull but never read for counting.
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  likesCount?: number;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    // likes[] — dual source with Like collection (see likeController.toggleLikeComment).
    // Maintained via $addToSet/$pull but counts come from Like.countDocuments().
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

// Index for fetching comments by post
CommentSchema.index({ post: 1, createdAt: -1 });

CommentSchema.virtual('likesCount').get(function (this: IComment) {
  return (this.likes ?? []).length; //для устойчивости к undefined
});

CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.id; // ← убираем _id
    return ret;
  },
});
CommentSchema.set('toObject', { virtuals: true });

export default mongoose.model<IComment>('Comment', CommentSchema);
