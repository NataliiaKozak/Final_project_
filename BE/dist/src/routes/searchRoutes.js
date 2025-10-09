import { Router } from 'express';
import { searchUsers } from '../controllers/searchController.js';
const router = Router();
// router.get("/search", searchUsers); //чтобы запрос был /users/search?query=...
router.get('/', searchUsers);
// console.log("[routes] /api/search mounted");
// router.get("/", (req, res, next) => { 
//   console.log("[routes] GET /api/search hit", req.query); 
//   next(); 
// }, searchUsers);
export default router;
//# sourceMappingURL=searchRoutes.js.map