import { Router } from 'express';
import { index as getEmpresa } from '@/features/controllers/empresaController';
import tenantMiddleware from '@/middleware/tenantMiddleware';

const router = Router();

router.get('/empresa', tenantMiddleware, getEmpresa);

export default router;
