"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waiterController_1 = require("@/features/controllers/waiterController");
const waiterAuthMiddleware_1 = __importDefault(require("@/middleware/waiterAuthMiddleware"));
const router = (0, express_1.Router)();
// Public route - does not require authentication
router.get('/tables', waiterController_1.getTables);
// All subsequent routes in this file are protected by the waiter authentication middleware
router.use(waiterAuthMiddleware_1.default);
router.get('/orders/table/:tableId', waiterController_1.getActiveOrderForTable);
router.post('/orders', waiterController_1.createOrUpdateOrder);
router.put('/orders/:orderId/customer', waiterController_1.updateOrderCustomer);
router.get('/recibo/:orderId', waiterController_1.getReceiptOrder);
exports.default = router;
