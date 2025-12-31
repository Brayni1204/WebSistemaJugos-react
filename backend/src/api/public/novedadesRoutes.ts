// src/api/public/novedadesRoutes.ts
import { Router } from 'express';
import * as novedadController from '@/features/controllers/public/novedadController';

const router = Router();

router.get('/novedades', novedadController.index);
router.get('/novedades/:id', novedadController.show);

export default router;
