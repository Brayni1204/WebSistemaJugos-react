import { Router } from 'express';
import { updateOrderStatus } from '@/features/controllers/OrderController';
import authMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.patch('/orders/:id/status', authMiddleware, updateOrderStatus);

export default router;
