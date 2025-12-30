import { Router } from 'express';
import { index as getAllCategories } from '@/features/controllers/categoriaController';
import tenantMiddleware from '@/middleware/tenantMiddleware';

const router = Router();

// This route needs the tenant middleware to identify the tenant from the domain
router.get('/categorias', tenantMiddleware, getAllCategories);

export default router;
