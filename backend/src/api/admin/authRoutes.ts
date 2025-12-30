import { Router } from 'express';
import { adminLogin } from '@/features/controllers/authController';
import tenantMiddleware from '@/middleware/tenantMiddleware';

const router = Router();

// All routes in this file are for admin authentication
// The tenant middleware is required to identify the company/tenant
router.post('/login', tenantMiddleware, adminLogin);

export default router;
