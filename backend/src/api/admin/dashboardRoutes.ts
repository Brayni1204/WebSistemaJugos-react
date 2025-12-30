// src/api/admin/dashboardRoutes.ts
import { Router } from 'express';
import * as dashboardController from '@/features/controllers/admin/dashboardController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

// For now, only users with 'view-orders' can see dashboard stats.
// We can create a dedicated 'view-dashboard' permission later.
router.get('/dashboard/stats', checkPermission('view-orders'), dashboardController.getDashboardStats);
router.get('/dashboard/sales-over-time', checkPermission('view-orders'), dashboardController.getSalesOverTime);

export default router;
