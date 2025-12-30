// src/api/admin/userManagementRoutes.ts
import { Router } from 'express';
import { index, createUser, updateUser } from '@/features/controllers/admin/userManagementController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/users', checkPermission('view-users'), index);
router.post('/users', checkPermission('manage-users'), createUser);
router.put('/users/:id', checkPermission('manage-users'), updateUser);

export default router;
