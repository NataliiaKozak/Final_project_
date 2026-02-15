import Comment from '../models/CommentModel.js';
import Post from '../models/PostModel.js';
import { createNotification } from './notificationController.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';
// Add comment
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!text) {
            res.status(400).json({ message: 'Comment text is required' });
            return;
        }
        const post = await Post.findById(postId).populate('author', '_id username profileImage');
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const comment = new Comment({ user: userId, post: post._id, text });
        await comment.save();
        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
        if (post.author && post.author._id.toString() !== userId) {
            await createNotification(post.author._id, userId, 'commented_post', post._id, comment._id);
        }
        await comment.populate('user', 'username profileImage');
        res.json({ message: 'Comment added', comment });
    }
    catch (err) {
        res.status(500).json({ message: 'Error adding comment', error: toErrorMessage(err) });
    }
};
// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        if (comment.user.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await comment.deleteOne();
        await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
        res.json({ message: 'Comment deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error deleting comment', error: toErrorMessage(err) });
    }
};
// Get post comments
export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('user', 'username profileImage');
        res.json(comments);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching comments', error: toErrorMessage(err) });
    }
};
//# sourceMappingURL=commentController.js.map