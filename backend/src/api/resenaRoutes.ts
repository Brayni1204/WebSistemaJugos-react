// src/api/resenaRoutes.ts
import { Router } from 'express';
import { index, store } from '@/features/controllers/resenaController';
import authenticateUser from '@/middleware/customerAuthMiddleware';

const router = Router();

// Routes for product reviews
router.get('/:productoId/resenas', index); // Get reviews for a product
router.post('/:productoId/resenas', authenticateUser, store); // Create a review for a product (requires user auth)

export default router;
