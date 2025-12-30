// src/api/admin/roleRoutes.ts
import { Router } from 'express';
import * as roleController from '@/features/controllers/admin/roleController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/roles', checkPermission('view-roles'), roleController.index);
router.post('/roles', checkPermission('manage-roles'), roleController.store);
router.get('/roles/:id', checkPermission('view-roles'), roleController.show);
router.put('/roles/:id', checkPermission('manage-roles'), roleController.update);
router.delete('/roles/:id', checkPermission('manage-roles'), roleController.destroy);

export default router;
