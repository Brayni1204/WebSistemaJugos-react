"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/tenantSettingsRoutes.ts
const express_1 = require("express");
const tenantController_1 = require("@/features/controllers/admin/tenantController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const uploadMiddleware_1 = __importDefault(require("@/middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
// All routes are admin-protected
router.use(authMiddleware_1.default);
router.get('/tenant/settings', (0, permissionMiddleware_1.checkPermission)('manage-settings'), tenantController_1.getTenantSettings);
router.put('/tenant/settings', (0, permissionMiddleware_1.checkPermission)('manage-settings'), tenantController_1.updateTenantSettings);
router.put('/tenant/settings/images', (0, permissionMiddleware_1.checkPermission)('manage-settings'), uploadMiddleware_1.default.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), tenantController_1.updateTenantImages);
exports.default = router;
