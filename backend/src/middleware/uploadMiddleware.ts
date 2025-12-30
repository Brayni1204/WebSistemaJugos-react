// src/middleware/uploadMiddleware.ts
import multer from 'multer';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        // Pass the error and let multer handle it.
        return cb(new Error('Not an image! Please upload an image file.'));
    }
    cb(null, true);
  },
});

export default upload;
