"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paginaController_1 = require("@/features/controllers/paginaController");
const tenantMiddleware_1 = __importDefault(require("@/middleware/tenantMiddleware"));
const router = (0, express_1.Router)();
router.get('/paginas', tenantMiddleware_1.default, paginaController_1.getPublicPages);
exports.default = router;
