import { Router } from 'express';
import { index, store, show, update, destroy } from '@/features/controllers/categoriaController';
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


router.get('/categorias', checkPermission('view-categories'), index);
router.post('/categorias', checkPermission('manage-categories'), upload.single('imagen'), store);
router.get('/categorias/:id', checkPermission('view-categories'), show);
router.put('/categorias/:id', checkPermission('manage-categories'), upload.single('imagen'), update);
router.delete('/categorias/:id', checkPermission('manage-categories'), destroy);

export default router;
