import mongoose, { Schema } from "mongoose";
const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        required: true,
        enum: ["liked_post", "liked_comment", "commented_post", "followed_user"],
    },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
// Index for fetching user notifications sorted by date
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
export default mongoose.model("Notification", NotificationSchema);
//# sourceMappingURL=NotificationModel.js.map