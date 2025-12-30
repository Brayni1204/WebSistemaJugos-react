"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/uploadMiddleware.ts
const multer_1 = __importDefault(require("multer"));
// Configure multer for in-memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
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
exports.default = upload;
