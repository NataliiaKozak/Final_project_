import mongoose, { Schema } from 'mongoose';
const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    // author: Types.ObjectId // дублировало `user`. Автор комментария = user
}, { timestamps: true });
CommentSchema.virtual('likesCount').get(function () {
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
export default mongoose.model('Comment', CommentSchema);
//# sourceMappingURL=CommentModel.js.map