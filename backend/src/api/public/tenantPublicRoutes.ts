import { Router } from 'express';
import { getTenantTheme } from '@/features/controllers/tenantController';

const router = Router();

// This route is public and does not require API key authentication.
// It retrieves theme information for a given tenant.
router.get('/theme', getTenantTheme);

export default router;
