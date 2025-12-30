// src/api/componenteRoutes.ts
import { Router } from 'express';
import { index, store, destroy } from '@/features/controllers/componenteController';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

// These are all management actions, so they require 'manage-products'
router.get('/componentes', checkPermission('manage-products'), index);
router.post('/componentes', checkPermission('manage-products'), store);
router.delete('/componentes/:id', checkPermission('manage-products'), destroy);

export default router;
