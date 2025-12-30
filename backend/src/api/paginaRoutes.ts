import { Router } from 'express';
import { getPublicPages } from '@/features/controllers/paginaController';

const router = Router();

router.get('/paginas', getPublicPages);

export default router;
