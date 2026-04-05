import { Router } from 'express';
import { createContact, getContacts, getContactById } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Public route - submit contact form
router.post('/', createContact);
// Protected routes
router.get('/', authMiddleware, getContacts);
router.get('/:id', authMiddleware, getContactById);
export default router;
//# sourceMappingURL=contact.routes.js.map