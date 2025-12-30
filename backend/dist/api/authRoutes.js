"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("@/features/controllers/authController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/verify-email', authController_1.verifyEmail);
router.post('/waiter/verify-pin', authController_1.verifyWaiterPin);
router.get('/me', authMiddleware_1.default, authController_1.getMe);
exports.default = router;
