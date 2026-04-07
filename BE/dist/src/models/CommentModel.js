import mongoose, { Schema } from 'mongoose';
const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    // likes[] — dual source with Like collection (see likeController.toggleLikeComment).
    // Maintained via $addToSet/$pull but counts come from Like.countDocuments().
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
}, { timestamps: true });
// Index for fetching comments by post
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.virtual('likesCount').get(function () {
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
export default mongoose.model('Comment', CommentSchema);
//# sourceMappingURL=CommentModel.js.map