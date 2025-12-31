"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/reviewManagementRoutes.ts
const express_1 = require("express");
const reviewManagementController_1 = require("@/features/controllers/admin/reviewManagementController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
// For now, we can reuse 'manage-products' or a similar permission.
// Ideally, a 'manage-reviews' permission should be created.
const permission = 'manage-products';
router.get('/reviews', (0, permissionMiddleware_1.checkPermission)(permission), reviewManagementController_1.index);
router.put('/reviews/:id/status', (0, permissionMiddleware_1.checkPermission)(permission), reviewManagementController_1.updateStatus);
exports.default = router;
