"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paginaController_1 = require("@/features/controllers/paginaController");
const router = (0, express_1.Router)();
router.get('/paginas', paginaController_1.getPublicPages);
exports.default = router;
