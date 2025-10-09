import mongoose, { Schema } from "mongoose";
const FollowSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
export default mongoose.model("Follow", FollowSchema);
//# sourceMappingURL=FollowModel.js.map