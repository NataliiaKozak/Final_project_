import { Router } from "express";
import { registerUser, loginUser, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validation/authSchemas.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), requestPasswordReset);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
