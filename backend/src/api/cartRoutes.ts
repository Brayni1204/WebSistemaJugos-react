// src/api/cartRoutes.ts
import { Router } from 'express';
import { getCart, addItemToCart, updateCartItemQuantity, removeItemFromCart, clearCart } from '@/features/controllers/cartController';
import authenticateUser from '@/middleware/customerAuthMiddleware';

const router = Router();

// All cart routes require user authentication
router.use(authenticateUser);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items/:itemId/quantity', updateCartItemQuantity);
router.delete('/items/:itemId', removeItemFromCart);
router.delete('/clear', clearCart);

export default router;
