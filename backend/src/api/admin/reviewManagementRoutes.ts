// src/api/admin/reviewManagementRoutes.ts
import { Router } from 'express';
import { index, updateStatus } from '@/features/controllers/admin/reviewManagementController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

// For now, we can reuse 'manage-products' or a similar permission.
// Ideally, a 'manage-reviews' permission should be created.
const permission = 'manage-products'; 

router.get('/reviews', checkPermission(permission), index);
router.put('/reviews/:id/status', checkPermission(permission), updateStatus);

export default router;
