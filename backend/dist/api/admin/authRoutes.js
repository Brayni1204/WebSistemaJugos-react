"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("@/features/controllers/authController");
const tenantMiddleware_1 = __importDefault(require("@/middleware/tenantMiddleware"));
const router = (0, express_1.Router)();
// All routes in this file are for admin authentication
// The tenant middleware is required to identify the company/tenant
router.post('/login', tenantMiddleware_1.default, authController_1.adminLogin);
exports.default = router;
