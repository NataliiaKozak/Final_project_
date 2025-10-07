import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId; // кто отправил
  recipient: Types.ObjectId; // кому отправил
  text: string; // текст сообщения
  createdAt: Date;
  // updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true } //  автоматически
);

export default mongoose.model<IMessage>('Message', MessageSchema);


