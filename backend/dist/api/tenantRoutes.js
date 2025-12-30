"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantController_1 = require("@/features/controllers/tenantController");
const multer_1 = __importDefault(require("multer"));
// Use memory storage for multer as we'll pass the buffer to a cloud service
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.post('/tenants', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'hero_banner', maxCount: 1 },
    { name: 'og_image_url', maxCount: 1 }
]), tenantController_1.createTenant);
exports.default = router;
