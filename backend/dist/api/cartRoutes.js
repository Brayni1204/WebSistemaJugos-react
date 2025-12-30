"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/cartRoutes.ts
const express_1 = require("express");
const cartController_1 = require("@/features/controllers/cartController");
const customerAuthMiddleware_1 = __importDefault(require("@/middleware/customerAuthMiddleware"));
const router = (0, express_1.Router)();
// All cart routes require user authentication
router.use(customerAuthMiddleware_1.default);
router.get('/', cartController_1.getCart);
router.post('/items', cartController_1.addItemToCart);
router.patch('/items/:itemId/quantity', cartController_1.updateCartItemQuantity);
router.delete('/items/:itemId', cartController_1.removeItemFromCart);
router.delete('/clear', cartController_1.clearCart);
exports.default = router;
