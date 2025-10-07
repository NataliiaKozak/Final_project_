import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFollow extends Document {
  _id: Types.ObjectId;
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model<IFollow>("Follow", FollowSchema);
