"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantImages = exports.updateTenantSettings = exports.getTenantSettings = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get the current tenant's settings
const getTenantSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        // We can re-use the tenant object already attached by the middleware
        res.status(200).json(req.tenant);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching tenant settings.' });
    }
});
exports.getTenantSettings = getTenantSettings;
// Update the current tenant's settings
const updateTenantSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _b = req.body, { id, subdomain } = _b, updateData = __rest(_b, ["id", "subdomain"]);
    // We explicitly exclude 'subdomain' and 'id' from the update payload
    // to prevent them from being changed.
    try {
        const updatedTenant = yield prisma_1.default.tenant.update({
            where: { id: tenantId },
            data: updateData,
        });
        res.status(200).json(updatedTenant);
    }
    catch (error) {
        console.error('Error updating tenant settings:', error);
        res.status(500).json({ error: 'An error occurred while updating tenant settings.' });
    }
});
exports.updateTenantSettings = updateTenantSettings;
const cloudinary_1 = require("@/utils/cloudinary");
const updateTenantImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    if (!req.files) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
    const files = req.files;
    const dataToUpdate = {};
    try {
        const uploadPromises = [];
        if (files.logo) {
            const logoFile = files.logo[0];
            uploadPromises.push((0, cloudinary_1.uploadStream)(logoFile.buffer, `tenants/${tenantId}/logos`).then(result => {
                dataToUpdate.logo_url = result.secure_url;
            }));
        }
        if (files.favicon) {
            const faviconFile = files.favicon[0];
            uploadPromises.push((0, cloudinary_1.uploadStream)(faviconFile.buffer, `tenants/${tenantId}/favicons`).then(result => {
                dataToUpdate.favicon_url = result.secure_url;
            }));
        }
        yield Promise.all(uploadPromises);
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ error: 'No valid image fields (logo, favicon) provided.' });
        }
        const updatedTenant = yield prisma_1.default.tenant.update({
            where: { id: tenantId },
            data: dataToUpdate,
        });
        res.status(200).json(updatedTenant);
    }
    catch (error) {
        console.error('Error uploading tenant images:', error);
        res.status(500).json({ error: 'An error occurred during image upload.' });
    }
});
exports.updateTenantImages = updateTenantImages;
