import { Router } from 'express';
import { index, store, show, update, destroy } from '@/features/controllers/productoController';
import { checkPermission } from '@/middleware/permissionMiddleware';
import adminAuthMiddleware from '@/middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// This middleware protects all subsequent routes in this file
router.use(adminAuthMiddleware);

// Configure Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Temporary directory for uploads before Cloudinary
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
});


router.get('/productos', checkPermission('view-products'), index);
router.post('/productos', checkPermission('manage-products'), upload.single('imagen'), store);
router.get('/productos/:id', checkPermission('view-products'), show);
router.put('/productos/:id', checkPermission('manage-products'), upload.single('imagen'), update);
router.delete('/productos/:id', checkPermission('manage-products'), destroy);

export default router;
