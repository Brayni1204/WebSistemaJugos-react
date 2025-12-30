// src/api/public/productoRoutes.ts
import { Router } from 'express';
import { publicIndex, publicShow } from '@/features/controllers/productoController';

const router = Router();

// Public route to get all products for the current tenant
router.get('/productos', publicIndex);
router.get('/productos/:id', publicShow);

export default router;
