import { Router } from 'express';
import { register, login, getMe, verifyEmail, verifyWaiterPin } from '@/features/controllers/authController';
import authenticateUser from '@/middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/waiter/verify-pin', verifyWaiterPin);
router.get('/me', authenticateUser, getMe);

export default router;
