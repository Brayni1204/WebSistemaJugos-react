"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/mesaRoutes.ts
const express_1 = require("express");
const mesaController_1 = require("@/features/controllers/mesaController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// All table management routes are admin-only
router.use(authMiddleware_1.default);
router.get('/mesas', (0, permissionMiddleware_1.checkPermission)('view-mesas'), mesaController_1.index);
router.post('/mesas', (0, permissionMiddleware_1.checkPermission)('manage-mesas'), mesaController_1.store);
router.get('/mesas/:id', (0, permissionMiddleware_1.checkPermission)('view-mesas'), mesaController_1.show);
router.put('/mesas/:id', (0, permissionMiddleware_1.checkPermission)('manage-mesas'), mesaController_1.update);
router.delete('/mesas/:id', (0, permissionMiddleware_1.checkPermission)('manage-mesas'), mesaController_1.destroy);
router.get('/mesas/:id/qr', (0, permissionMiddleware_1.checkPermission)('manage-mesas'), mesaController_1.generateQrCode);
exports.default = router;
