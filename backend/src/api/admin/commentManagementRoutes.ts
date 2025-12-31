// src/api/admin/commentManagementRoutes.ts
import { Router } from 'express';
import * as commentController from '@/features/controllers/admin/commentManagementController';
import adminAuthMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/comments', commentController.listComments);
router.patch('/comments/:commentId/status', commentController.updateCommentStatus);
router.delete('/comments/:commentId', commentController.deleteComment);

export default router;
