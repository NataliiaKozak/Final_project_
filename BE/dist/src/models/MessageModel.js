import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
}, { timestamps: true } //  автоматически
);
// Compound index for fetching conversation between two users
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
export default mongoose.model('Message', MessageSchema);
//# sourceMappingURL=MessageModel.js.map