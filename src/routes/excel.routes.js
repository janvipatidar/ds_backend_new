import { Router } from 'express';
import { uploadExcel, exportExcel, uploadMiddleware } from '../controllers/excel.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/upload', authMiddleware, uploadMiddleware, uploadExcel);
router.get('/export', authMiddleware, exportExcel);

export default router;
