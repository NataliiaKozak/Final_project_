import { Router } from "express";
import { getFollowers, getFollowing, followUser, unfollowUser } from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);
router.post("/:userId/follow", protect, followUser);
router.delete("/:userId/unfollow", protect, unfollowUser);

export default router;
