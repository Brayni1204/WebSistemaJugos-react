"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresaController_1 = require("@/features/controllers/empresaController");
const tenantMiddleware_1 = __importDefault(require("@/middleware/tenantMiddleware"));
const router = (0, express_1.Router)();
router.get('/empresa', tenantMiddleware_1.default, empresaController_1.index);
exports.default = router;
