// src/api/admin/proveedorRoutes.ts
import { Router } from 'express';
import * as proveedorController from '@/features/controllers/admin/proveedorController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
// I'll create a permission for this later if needed, for now just admin auth
// import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/proveedores', proveedorController.index);
router.post('/proveedores', proveedorController.store);
router.put('/proveedores/:id', proveedorController.update);
router.delete('/proveedores/:id', proveedorController.destroy);

export default router;
