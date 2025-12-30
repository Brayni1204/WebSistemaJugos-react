// src/api/public/orderRoutes.ts
import { Router } from 'express';
import { placeOrder } from '@/features/controllers/public/orderController';

const router = Router();

// This route is public and does not require any authentication
router.post('/orders', placeOrder);

export default router;
