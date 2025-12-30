"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import the middleware
const router = (0, express_1.Router)();
router.get('/users', authMiddleware_1.authenticateToken, userController_1.getAllUsers); // Protect the route
router.get('/users/:id', userController_1.getUserById);
exports.default = router;
