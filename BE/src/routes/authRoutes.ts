import { Router } from "express";
import { registerUser, loginUser, requestPasswordReset, resetPassword } from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/request-reset", requestPasswordReset);
router.post("/forgot-password", requestPasswordReset)
router.post("/reset-password", resetPassword);

export default router;
