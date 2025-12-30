import { Router } from 'express';
import { getPublicPages } from '@/features/controllers/paginaController';
import tenantMiddleware from '@/middleware/tenantMiddleware';

const router = Router();

router.get('/paginas', tenantMiddleware, getPublicPages);

export default router;
