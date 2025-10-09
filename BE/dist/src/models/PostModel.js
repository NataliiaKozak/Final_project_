import mongoose, { Schema } from 'mongoose';
const PostSchema = new Schema({
    description: { type: String, required: false },
    image: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like', default: [] }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', default: [] }],
}, { timestamps: true, id: false });
// Виртуальные поля // стало (устойчиво к undefined) не подтягивались посты
PostSchema.virtual('likesCount').get(function () {
    // return this.likes.length;
    return (this.likes ?? []).length;
});
PostSchema.virtual('commentsCount').get(function () {
    // return this.comments.length;
    return (this.comments ?? []).length;
});
//для фронта визуально без 2 id
PostSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        // ret.id = String(ret._id);
        delete ret.id; // ← убираем _id
        return ret;
    },
});
PostSchema.set('toObject', { virtuals: true });
export default mongoose.model('Post', PostSchema);
//# sourceMappingURL=PostModel.js.map