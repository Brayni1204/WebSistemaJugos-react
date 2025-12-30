"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderController_1 = require("@/features/controllers/OrderController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.patch('/orders/:id/status', authMiddleware_1.default, OrderController_1.updateOrderStatus);
exports.default = router;
