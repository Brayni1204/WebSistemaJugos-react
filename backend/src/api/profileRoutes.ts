// src/api/profileRoutes.ts
import { Router } from 'express';
import { getProfile, updateProfile, getOrders } from '@/features/controllers/profileController';
import authenticateUser from '@/middleware/customerAuthMiddleware';

const router = Router();

// All profile routes require user authentication
router.use(authenticateUser);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/orders', getOrders);

export default router;
