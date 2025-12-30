"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/componenteRoutes.ts
const express_1 = require("express");
const componenteController_1 = require("@/features/controllers/componenteController");
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// These are all management actions, so they require 'manage-products'
router.get('/componentes', (0, permissionMiddleware_1.checkPermission)('manage-products'), componenteController_1.index);
router.post('/componentes', (0, permissionMiddleware_1.checkPermission)('manage-products'), componenteController_1.store);
router.delete('/componentes/:id', (0, permissionMiddleware_1.checkPermission)('manage-products'), componenteController_1.destroy);
exports.default = router;
