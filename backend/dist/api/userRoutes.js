"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("@/features/controllers/userController");
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware")); // Import the default export
const router = (0, express_1.Router)();
router.get('/users', authMiddleware_1.default, userController_1.getAllUsers); // Protect the route
router.get('/users/:id', authMiddleware_1.default, userController_1.getUserById); // Also protect this route
exports.default = router;
