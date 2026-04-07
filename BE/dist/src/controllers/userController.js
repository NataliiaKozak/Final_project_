import User from '../models/UserModel.js';
import Post from '../models/PostModel.js';
import Comment from '../models/CommentModel.js';
import Like from '../models/LikeModel.js';
import Notification from '../models/NotificationModel.js';
import Follow from '../models/FollowModel.js';
import { uploadImage } from '../config/storage.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';
// Get user profile
export const getProfile = async (req, res) => {
    try {
        const id = req.params.id;
        // followers/following arrays removed from User model — Follow model is the
        // single source of truth. Counts come from Follow.countDocuments() below.
        const user = await User.findById(id)
            .select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const [postsCount, commentsCount, likesCount, notificationsCount, followersCount, followingCount] = await Promise.all([
            Post.countDocuments({ author: id }),
            Comment.countDocuments({ user: id }),
            Like.countDocuments({ user: id }),
            Notification.countDocuments({ user: id }),
            Follow.countDocuments({ following: id }),
            Follow.countDocuments({ follower: id }),
        ]);
        let isFollowing = false;
        if (req.user?.id && req.user.id !== id) {
            const existing = await Follow.findOne({ follower: req.user.id, following: id });
            isFollowing = !!existing;
        }
        res.status(200).json({
            ...user.toObject(),
            followersCount,
            followingCount,
            postsCount,
            commentsCount,
            likesCount,
            notificationsCount,
            isFollowing,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching profile', error: toErrorMessage(err) });
    }
};
// Update profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { username, bio, fullName, website } = req.body;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (username !== undefined)
            user.username = username;
        if (bio !== undefined)
            user.bio = bio;
        if (fullName !== undefined)
            user.fullName = fullName;
        if (website !== undefined)
            user.website = website;
        if (req.file) {
            const imageUrl = await uploadImage(req.file, 'profileImages');
            user.profileImage = imageUrl;
        }
        await user.save();
        const postsCount = await Post.countDocuments({ author: userId });
        const { __v, ...safe } = user.toObject();
        res.json({ ...safe, postsCount });
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: toErrorMessage(err) });
    }
};
//# sourceMappingURL=userController.js.map