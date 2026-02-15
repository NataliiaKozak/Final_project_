import Follow from '../models/FollowModel.js';
import { createNotification } from './notificationController.js';
import { Types } from 'mongoose';
import { toErrorMessage } from '../utils/toErrorMessage.js';
// Get followers of userId
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid userId' });
            return;
        }
        const followers = await Follow.find({ following: userId }).populate('follower', 'username profileImage');
        res.json(followers.map((s) => s.follower));
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching followers', error: toErrorMessage(err) });
    }
};
// Get following of userId
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid userId' });
            return;
        }
        const following = await Follow.find({ follower: userId }).populate('following', 'username profileImage');
        res.json(following.map((s) => s.following));
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching following', error: toErrorMessage(err) });
    }
};
// Follow user
export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user?.id;
        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid userId' });
            return;
        }
        if (followerId === userId) {
            res.status(400).json({ message: 'Cannot follow yourself' });
            return;
        }
        const existing = await Follow.findOne({ follower: followerId, following: userId });
        if (existing) {
            res.status(400).json({ message: 'Already following' });
            return;
        }
        const follow = new Follow({ follower: followerId, following: userId });
        await follow.save();
        await createNotification(String(userId), String(followerId), 'followed_user');
        res.json({ message: 'Followed successfully', follow });
    }
    catch (err) {
        res.status(500).json({ message: 'Error following user', error: toErrorMessage(err) });
    }
};
// Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user?.id;
        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const follow = await Follow.findOneAndDelete({
            follower: followerId,
            following: userId,
        });
        if (!follow) {
            res.status(400).json({ message: 'Not following this user' });
            return;
        }
        res.json({ message: 'Unfollowed successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error unfollowing user', error: toErrorMessage(err) });
    }
};
//# sourceMappingURL=followController.js.map