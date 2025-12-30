// src/api/admin/gastoRoutes.ts
import { Router } from 'express';
import * as gastoController from '@/features/controllers/admin/gastoController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
// import { checkPermission } from '@/middleware/permissionMiddleware'; // Will add permissions later

const router = Router();

router.use(adminAuthMiddleware);

router.get('/gastos', gastoController.index);
router.post('/gastos', gastoController.store);

export default router;