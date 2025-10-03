import { Router } from "express";
import { searchUsers } from "../controllers/searchController.js";

const router = Router();

router.get("/", searchUsers);

export default router;
