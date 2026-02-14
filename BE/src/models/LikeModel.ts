import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILike extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true }
);

// индексы для уникальности лайков (partialFilterExpression — индекс только для документов с реальным ObjectId)
LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $type: 'objectId' } } }
);
LikeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $type: 'objectId' } } }
);

export default mongoose.model<ILike>('Like', LikeSchema);
