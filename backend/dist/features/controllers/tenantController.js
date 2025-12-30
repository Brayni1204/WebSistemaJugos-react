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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = exports.getTenantTheme = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const bcrypt = __importStar(require("bcrypt"));
// We would configure Cloudinary here using credentials from .env
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({ ... });
const getTenantTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real multi-tenant app, you'd resolve the tenant from the hostname (e.g., req.hostname)
    // For simplicity here, we'll use a query parameter.
    const { subdomain } = req.query;
    if (!subdomain || typeof subdomain !== 'string') {
        return res.status(400).json({ message: 'Subdomain query parameter is required.' });
    }
    try {
        const tenant = yield prisma_1.default.tenant.findUnique({
            where: { subdomain },
            select: {
                theme_color: true,
                theme_secondary_color: true,
                dark_mode_enabled: true,
            },
        });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found.' });
        }
        res.status(200).json({
            theme_color: tenant.theme_color || '#0d9488', // Default to a teal color if not set
            theme_secondary_color: tenant.theme_secondary_color || '#166534', // Default to a green color if not set
            dark_mode_enabled: tenant.dark_mode_enabled,
        });
    }
    catch (error) {
        console.error(`Error fetching theme for subdomain ${subdomain}:`, error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.getTenantTheme = getTenantTheme;
const createTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, subdomain, adminEmail, adminPassword, business_email, contact_phone, keywords, description, theme_color, address, about_us,
    // faq, shipping_policy, terms_conditions, social_links, etc.
     } = req.body;
    try {
        // Check if subdomain already exists
        const existingTenant = yield prisma_1.default.tenant.findUnique({ where: { subdomain } });
        if (existingTenant) {
            return res.status(409).json({ message: 'Subdomain already in use.' });
        }
        // Using a transaction to ensure all or nothing is created
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Get all permissions that should be assigned to the admin role
            const allPermissions = yield tx.permission.findMany();
            const allPermissionIds = allPermissions.map(p => ({ id: p.id }));
            // 2. Create the tenant
            const newTenant = yield tx.tenant.create({
                data: {
                    name,
                    subdomain,
                    business_email,
                    contact_phone,
                    description,
                    theme_color,
                    theme_secondary_color: '#166534', // A default secondary color (e.g., green-800)
                    address,
                    about_us,
                },
            });
            // 3. Create the "Admin" role for this tenant and connect all permissions
            const adminRole = yield tx.role.create({
                data: {
                    name: 'Admin',
                    tenantId: newTenant.id,
                    permissions: {
                        connect: allPermissionIds,
                    },
                },
            });
            // 4. Hash the admin password
            const hashedPassword = yield bcrypt.hash(adminPassword, 10);
            // 5. Create the admin user and connect them to the Admin role
            const newAdmin = yield tx.user.create({
                data: {
                    name: `${name} Admin`,
                    email: adminEmail,
                    password: hashedPassword,
                    tenantId: newTenant.id,
                    roles: {
                        connect: { id: adminRole.id },
                    },
                },
            });
            return { newTenant, newAdmin };
        }));
        res.status(201).json({
            message: 'Tenant created successfully!',
            tenant: result.newTenant,
            admin: { id: result.newAdmin.id, email: result.newAdmin.email },
        });
    }
    catch (error) {
        // Check for specific unique constraint errors that might not be caught by the initial check
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A user with this email may already exist for the tenant, or another unique constraint was violated.' });
        }
        console.error('Error creating tenant:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.createTenant = createTenant;
