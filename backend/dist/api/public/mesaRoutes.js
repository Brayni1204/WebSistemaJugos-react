"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/public/mesaRoutes.ts
const express_1 = require("express");
const mesaController_1 = require("@/features/controllers/public/mesaController");
const router = (0, express_1.Router)();
// This route is public and does not require any authentication
router.get('/mesas/:uuid/pedidos', mesaController_1.getActiveOrdersForTable);
exports.default = router;
