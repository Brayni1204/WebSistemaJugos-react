"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/resenaRoutes.ts
const express_1 = require("express");
const resenaController_1 = require("@/features/controllers/resenaController");
const customerAuthMiddleware_1 = __importDefault(require("@/middleware/customerAuthMiddleware"));
const router = (0, express_1.Router)();
// Routes for product reviews
router.get('/:productoId/resenas', resenaController_1.index); // Get reviews for a product
router.post('/:productoId/resenas', customerAuthMiddleware_1.default, resenaController_1.store); // Create a review for a product (requires user auth)
exports.default = router;
