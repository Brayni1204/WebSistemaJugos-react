// src/api/admin/novedadesRoutes.ts
import { Router } from 'express';
import * as novedadController from '@/features/controllers/admin/novedadController';
import adminAuthMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/novedades', novedadController.index);
router.post('/novedades', novedadController.store);
router.get('/novedades/:id', novedadController.show);
router.put('/novedades/:id', novedadController.update);
router.delete('/novedades/:id', novedadController.destroy);

export default router;
