import { Router } from 'express';
import { createTenant } from '@/features/controllers/tenantController'; 
import multer from 'multer';

// Use memory storage for multer as we'll pass the buffer to a cloud service
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post(
  '/tenants',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'hero_banner', maxCount: 1 },
    { name: 'og_image_url', maxCount: 1 }
  ]),
  createTenant
);

export default router;
