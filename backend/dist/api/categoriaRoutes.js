"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriaController_1 = require("@/features/controllers/categoriaController");
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// This middleware protects all subsequent routes in this file
router.use(authMiddleware_1.default);
// Configure Multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            // Temporary directory for uploads before Cloudinary
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path_1.default.extname(file.originalname));
        }
    }),
});
router.get('/categorias', (0, permissionMiddleware_1.checkPermission)('view-categories'), categoriaController_1.index);
router.post('/categorias', (0, permissionMiddleware_1.checkPermission)('manage-categories'), upload.single('imagen'), categoriaController_1.store);
router.get('/categorias/:id', (0, permissionMiddleware_1.checkPermission)('view-categories'), categoriaController_1.show);
router.put('/categorias/:id', (0, permissionMiddleware_1.checkPermission)('manage-categories'), upload.single('imagen'), categoriaController_1.update);
router.delete('/categorias/:id', (0, permissionMiddleware_1.checkPermission)('manage-categories'), categoriaController_1.destroy);
exports.default = router;
