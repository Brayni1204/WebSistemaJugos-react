"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("@/features/controllers/admin/orderController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// All routes are admin-protected
router.use(authMiddleware_1.default);
router.get('/pedidos', (0, permissionMiddleware_1.checkPermission)('view-orders'), orderController_1.index);
router.post('/pedidos', (0, permissionMiddleware_1.checkPermission)('manage-orders'), orderController_1.store);
router.get('/pedidos/:id', (0, permissionMiddleware_1.checkPermission)('view-orders'), orderController_1.show);
router.put('/pedidos/:id', (0, permissionMiddleware_1.checkPermission)('manage-orders'), orderController_1.update);
exports.default = router;
