import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
SubscriptionSchema.index({ follower: 1, following: 1 }, { unique: true });
export default mongoose.model("Subscription", SubscriptionSchema);
//# sourceMappingURL=SubscriptionModel.js.map