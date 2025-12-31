"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/public/productoRoutes.ts
const express_1 = require("express");
const productoController_1 = require("@/features/controllers/productoController");
const router = (0, express_1.Router)();
// Public route to get all products for the current tenant
router.get('/productos', productoController_1.publicIndex);
router.get('/productos/:id', productoController_1.publicShow);
exports.default = router;
