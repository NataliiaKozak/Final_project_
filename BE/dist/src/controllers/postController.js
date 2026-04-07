import { Types } from 'mongoose';
import Post from '../models/PostModel.js';
import Like from '../models/LikeModel.js';
import Comment from '../models/CommentModel.js';
import { uploadImage } from '../config/storage.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';
const MAX_DESCRIPTION_LENGTH = 200;
const EXPLORE_SAMPLE_SIZE = 10;
/**
 * Attach likesCount, commentsCount, isLikedByMe to each post.
 *
 * PERF NOTE: This makes 3 DB queries per post (Like.countDocuments,
 * Comment.countDocuments, Like.exists). For N posts this results in 3N queries
 * (N+1 problem). Current approach is acceptable for small datasets.
 *
 * For production at scale, replace with one of:
 *  1. MongoDB $lookup aggregation — single pipeline instead of N queries.
 *  2. Denormalization — store likesCount/commentsCount directly on the Post
 *     document and update them atomically on like/comment toggle ($inc).
 *  3. Caching — Redis cache for hot counters with TTL-based invalidation.
 */
async function enrichPosts(posts, currentUserId) {
    return Promise.all(posts.map(async (post) => {
        const [likesCount, commentsCount, likeDoc] = await Promise.all([
            Like.countDocuments({ post: post._id }),
            Comment.countDocuments({ post: post._id }),
            currentUserId ? Like.exists({ user: currentUserId, post: post._id }) : null,
        ]);
        return { ...post, likesCount, commentsCount, isLikedByMe: likeDoc !== null };
    }));
}
/* ==================== Get all posts ==================== */
export const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.excludeAuthor) {
            filter.author = { $ne: req.query.excludeAuthor };
        }
        const [posts, total] = await Promise.all([
            Post.find(filter)
                .populate('author', 'username profileImage fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(filter),
        ]);
        const enriched = await enrichPosts(posts, currentUserId);
        res.json({ posts: enriched, total, page, pages: Math.ceil(total / limit) });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching posts', error: toErrorMessage(err) });
    }
};
/* =================== Posts by user ===================== */
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const posts = await Post.find({ author: userId })
            .populate('author', 'username profileImage fullName')
            .sort({ createdAt: -1 })
            .lean();
        if (!posts || posts.length === 0) {
            res.status(404).json({ message: 'No posts found for this user' });
            return;
        }
        res.json(await enrichPosts(posts, currentUserId));
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching user posts', error: toErrorMessage(err) });
    }
};
/* ================== Post by ID ========================= */
export const getPostById = async (req, res) => {
    try {
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid post ID' });
            return;
        }
        const post = await Post.findById(req.params.id)
            .populate('author', 'username fullName profileImage')
            .populate({
            path: 'comments',
            populate: { path: 'user', select: 'username fullName profileImage' },
        })
            .lean();
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const currentUserId = req.user?.id;
        const [likesCount, commentsCount, likeDoc] = await Promise.all([
            Like.countDocuments({ post: post._id }),
            Comment.countDocuments({ post: post._id }),
            currentUserId ? Like.exists({ user: currentUserId, post: post._id }) : null,
        ]);
        res.json({ ...post, likesCount, commentsCount, isLikedByMe: likeDoc !== null });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching post', error: toErrorMessage(err) });
    }
};
/* =================== Create post ======================= */
export const createPost = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'Image is required' });
            return;
        }
        const description = req.body.description || '';
        if (description.length > MAX_DESCRIPTION_LENGTH) {
            res.status(400).json({ message: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters` });
            return;
        }
        const imageUrl = await uploadImage(req.file, 'posts');
        const newPost = new Post({
            author: new Types.ObjectId(req.user.id),
            image: imageUrl,
            description,
        });
        await newPost.save();
        res.status(201).json(newPost);
    }
    catch (err) {
        res.status(500).json({ message: 'Error creating post', error: toErrorMessage(err) });
    }
};
/* =================== Update post ======================= */
export const updatePost = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid post ID' });
            return;
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        if (post.author.toString() !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        if (req.body.description !== undefined) {
            if (req.body.description.length > MAX_DESCRIPTION_LENGTH) {
                res.status(400).json({ message: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters` });
                return;
            }
            post.description = req.body.description;
        }
        if (req.file) {
            post.image = await uploadImage(req.file, 'posts');
        }
        await post.save();
        res.json(post);
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating post', error: toErrorMessage(err) });
    }
};
/* ===================== Delete post ====================== */
export const deletePost = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid post ID' });
            return;
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        if (post.author.toString() !== req.user.id) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error deleting post', error: toErrorMessage(err) });
    }
};
/* ====================== Explore (random posts) ========== */
export const explorePosts = async (_req, res) => {
    try {
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            res.json([]);
            return;
        }
        const sampleSize = Math.min(postCount, EXPLORE_SAMPLE_SIZE);
        const posts = await Post.aggregate([
            { $sample: { size: sampleSize } },
            { $project: { _id: 1, image: 1, createdAt: 1 } },
        ]);
        res.json(posts);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching explore posts', error: toErrorMessage(err) });
    }
};
//# sourceMappingURL=postController.js.map