import { Router } from 'express';
import { login, getMe } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
export default router;
//# sourceMappingURL=admin.routes.js.map