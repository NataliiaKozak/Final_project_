import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
