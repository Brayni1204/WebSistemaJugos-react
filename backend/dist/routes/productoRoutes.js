"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productoController_1 = require("../controllers/productoController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
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
router.get('/', productoController_1.index);
router.post('/', upload.single('imagen'), productoController_1.store); // 'imagen' is the field name for the file
router.get('/:id', productoController_1.show);
router.put('/:id', upload.single('imagen'), productoController_1.update);
router.delete('/:id', productoController_1.destroy);
exports.default = router;
