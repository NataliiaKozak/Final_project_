import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
}, { timestamps: true } //  автоматически
);
export default mongoose.model('Message', MessageSchema);
//recipient  receiver кому отправлено
//# sourceMappingURL=MessageModel.js.map