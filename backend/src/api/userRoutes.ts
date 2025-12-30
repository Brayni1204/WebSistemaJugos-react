import { Router } from 'express';
import { getAllUsers, getUserById } from '@/features/controllers/userController';
import authMiddleware from '@/middleware/authMiddleware'; // Import the default export

const router = Router();

router.get('/users', authMiddleware, getAllUsers); // Protect the route
router.get('/users/:id', authMiddleware, getUserById); // Also protect this route

export default router;
