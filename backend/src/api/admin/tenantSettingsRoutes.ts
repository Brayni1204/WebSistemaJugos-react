// src/api/admin/tenantSettingsRoutes.ts
import { Router } from 'express';
import { getTenantSettings, updateTenantSettings, updateTenantImages } from '@/features/controllers/admin/tenantController';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import { checkPermission } from '@/middleware/permissionMiddleware';
import upload from '@/middleware/uploadMiddleware';

const router = Router();

// All routes are admin-protected
router.use(adminAuthMiddleware);

router.get('/tenant/settings', checkPermission('manage-settings'), getTenantSettings);
router.put('/tenant/settings', checkPermission('manage-settings'), updateTenantSettings);
router.put(
    '/tenant/settings/images', 
    checkPermission('manage-settings'), 
    upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), 
    updateTenantImages
);

export default router;
