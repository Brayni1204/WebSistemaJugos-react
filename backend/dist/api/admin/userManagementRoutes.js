"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/userManagementRoutes.ts
const express_1 = require("express");
const userManagementController_1 = require("@/features/controllers/admin/userManagementController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.get('/users', (0, permissionMiddleware_1.checkPermission)('view-users'), userManagementController_1.index);
router.post('/users', (0, permissionMiddleware_1.checkPermission)('manage-users'), userManagementController_1.createUser);
router.put('/users/:id', (0, permissionMiddleware_1.checkPermission)('manage-users'), userManagementController_1.updateUser);
exports.default = router;
