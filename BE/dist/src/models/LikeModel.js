import mongoose, { Schema } from 'mongoose';
const LikeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, { timestamps: true });
// индексы для уникальности лайков
LikeSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
LikeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });
export default mongoose.model('Like', LikeSchema);
//# sourceMappingURL=LikeModel.js.map