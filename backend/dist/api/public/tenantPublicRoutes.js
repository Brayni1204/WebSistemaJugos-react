"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantController_1 = require("@/features/controllers/tenantController");
const router = (0, express_1.Router)();
// This route is public and does not require API key authentication.
// It retrieves theme information for a given tenant.
router.get('/theme', tenantController_1.getTenantTheme);
exports.default = router;
