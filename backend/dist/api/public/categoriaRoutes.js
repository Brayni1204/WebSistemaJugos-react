"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriaController_1 = require("@/features/controllers/categoriaController");
const tenantMiddleware_1 = __importDefault(require("@/middleware/tenantMiddleware"));
const router = (0, express_1.Router)();
// This route needs the tenant middleware to identify the tenant from the domain
router.get('/categorias', tenantMiddleware_1.default, categoriaController_1.index);
exports.default = router;
