// src/api/public/mesaRoutes.ts
import { Router } from 'express';
import { getActiveOrdersForTable } from '@/features/controllers/public/mesaController';

const router = Router();

// This route is public and does not require any authentication
router.get('/mesas/:uuid/pedidos', getActiveOrdersForTable);

export default router;
