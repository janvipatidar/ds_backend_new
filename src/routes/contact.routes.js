import { Router } from 'express';
import { createContact, getContacts, getContactById } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', createContact);

router.get('/', authMiddleware, getContacts);
router.get('/:id', authMiddleware, getContactById);

export default router;
