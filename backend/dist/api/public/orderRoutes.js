"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/public/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("@/features/controllers/public/orderController");
const router = (0, express_1.Router)();
// This route is public and does not require any authentication
router.post('/orders', orderController_1.placeOrder);
exports.default = router;
