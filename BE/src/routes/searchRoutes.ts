import { Router } from "express";
import { searchUsers } from "../controllers/searchController.js";

const router = Router();

router.get("/search", searchUsers); //чтобы запрос был /users/search?query=...

export default router;
