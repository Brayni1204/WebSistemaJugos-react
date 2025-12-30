"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/admin/roleRoutes.ts
const express_1 = require("express");
const roleController = __importStar(require("@/features/controllers/admin/roleController"));
const authMiddleware_1 = __importDefault(require("@/middleware/authMiddleware"));
const permissionMiddleware_1 = require("@/middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.get('/roles', (0, permissionMiddleware_1.checkPermission)('view-roles'), roleController.index);
router.post('/roles', (0, permissionMiddleware_1.checkPermission)('manage-roles'), roleController.store);
router.get('/roles/:id', (0, permissionMiddleware_1.checkPermission)('view-roles'), roleController.show);
router.put('/roles/:id', (0, permissionMiddleware_1.checkPermission)('manage-roles'), roleController.update);
router.delete('/roles/:id', (0, permissionMiddleware_1.checkPermission)('manage-roles'), roleController.destroy);
exports.default = router;
