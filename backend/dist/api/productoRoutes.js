"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productoController_1 = require("@/features/controllers/productoController");
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
router.get('/productos', (0, permissionMiddleware_1.checkPermission)('view-products'), productoController_1.index);
router.post('/productos', (0, permissionMiddleware_1.checkPermission)('manage-products'), upload.single('imagen'), productoController_1.store);
router.get('/productos/:id', (0, permissionMiddleware_1.checkPermission)('view-products'), productoController_1.show);
router.put('/productos/:id', (0, permissionMiddleware_1.checkPermission)('manage-products'), upload.single('imagen'), productoController_1.update);
router.delete('/productos/:id', (0, permissionMiddleware_1.checkPermission)('manage-products'), productoController_1.destroy);
exports.default = router;
