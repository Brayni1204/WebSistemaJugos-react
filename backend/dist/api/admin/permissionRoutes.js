"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/permissionRoutes.ts
const express_1 = require("express");
const permissionController_1 = require("@/features/controllers/admin/permissionController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
// Route to get all available permissions
router.get('/permissions', permissionController_1.index);
exports.default = router;
