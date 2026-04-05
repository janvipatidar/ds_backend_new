import { Router } from 'express';
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidateStats,
} from '../controllers/candidate.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', createCandidate);

router.get('/', authMiddleware, getCandidates);
router.get('/stats', authMiddleware, getCandidateStats);
router.get('/:id', authMiddleware, getCandidateById);
router.put('/:id', authMiddleware, updateCandidate);
router.delete('/:id', authMiddleware, deleteCandidate);

export default router;
