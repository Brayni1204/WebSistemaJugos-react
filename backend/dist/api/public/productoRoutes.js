"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/public/productoRoutes.ts
const express_1 = require("express");
const productoController_1 = require("@/features/controllers/productoController"); // This function needs to be created
const router = (0, express_1.Router)();
// Public route to get all products for the current tenant
router.get('/productos', productoController_1.publicIndex);
exports.default = router;
