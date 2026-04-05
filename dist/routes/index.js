import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import candidateRoutes from './candidate.routes.js';
import contactRoutes from './contact.routes.js';
import excelRoutes from './excel.routes.js';
const router = Router();
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/candidates', candidateRoutes);
router.use('/contact', contactRoutes);
router.use('/excel', excelRoutes);
export default router;
//# sourceMappingURL=index.js.map