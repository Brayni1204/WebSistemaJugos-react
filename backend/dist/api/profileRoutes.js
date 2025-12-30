"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/profileRoutes.ts
const express_1 = require("express");
const profileController_1 = require("@/features/controllers/profileController");
const customerAuthMiddleware_1 = __importDefault(require("@/middleware/customerAuthMiddleware"));
const router = (0, express_1.Router)();
// All profile routes require user authentication
router.use(customerAuthMiddleware_1.default);
router.get('/', profileController_1.getProfile);
router.put('/', profileController_1.updateProfile);
router.get('/orders', profileController_1.getOrders);
exports.default = router;
