// src/api/admin/orderRoutes.ts
import { Router } from 'express';
import { index, store, show, update } from '@/features/controllers/admin/orderController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

// All routes are admin-protected
router.use(adminAuthMiddleware);

router.get('/pedidos', checkPermission('view-orders'), index);
router.post('/pedidos', checkPermission('manage-orders'), store);
router.get('/pedidos/:id', checkPermission('view-orders'), show);
router.put('/pedidos/:id', checkPermission('manage-orders'), update);

export default router;
