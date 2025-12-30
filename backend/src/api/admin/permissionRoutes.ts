// src/api/admin/permissionRoutes.ts
import { Router } from 'express';
import { index } from '@/features/controllers/admin/permissionController';
import adminAuthMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

// Route to get all available permissions
router.get('/permissions', index);

export default router;
