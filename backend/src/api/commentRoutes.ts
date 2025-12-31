// src/api/commentRoutes.ts
import { Router } from 'express';
import * as commentController from '@/features/controllers/commentController';
import authenticateUser from '@/middleware/customerAuthMiddleware';

const router = Router();

// e.g., /api/comments/news/123 or /api/comments/about/1
router.get('/:pageType/:pageId', commentController.getCommentsForPage); 
router.post('/:pageType/:pageId', authenticateUser, commentController.createComment);

export default router;
