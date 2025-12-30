// src/api/mesaRoutes.ts
import { Router } from 'express';
import { index, store, show, update, destroy, generateQrCode } from '@/features/controllers/mesaController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

// All table management routes are admin-only
router.use(adminAuthMiddleware);

router.get('/mesas', checkPermission('view-mesas'), index);
router.post('/mesas', checkPermission('manage-mesas'), store);
router.get('/mesas/:id', checkPermission('view-mesas'), show);
router.put('/mesas/:id', checkPermission('manage-mesas'), update);
router.delete('/mesas/:id', checkPermission('manage-mesas'), destroy);
router.get('/mesas/:id/qr', checkPermission('manage-mesas'), generateQrCode);

export default router;
