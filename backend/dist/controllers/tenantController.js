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
exports.createTenant = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const bcrypt = __importStar(require("bcrypt"));
// We would configure Cloudinary here using credentials from .env
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({ ... });
const createTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, subdomain, adminEmail, adminPassword, business_email, contact_phone, keywords, description, theme_color, address, about_us,
    // faq, shipping_policy, terms_conditions, social_links, etc.
     } = req.body;
    try {
        // Check if subdomain or admin email already exists
        const existingTenant = yield prismaClient_1.default.tenant.findUnique({ where: { subdomain } });
        if (existingTenant) {
            return res.status(409).json({ message: 'Subdomain already in use.' });
        }
        const existingUser = yield prismaClient_1.default.user.findFirst({ where: { email: adminEmail } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this admin email already exists globally.' });
        }
        // TODO: Handle file uploads (logo, favicon etc.) from req.files
        // Example: const logoUrl = await uploadToCloudinary(req.files.logo[0]);
        // Create the tenant
        const newTenant = yield prismaClient_1.default.tenant.create({
            data: {
                name,
                subdomain,
                business_email,
                contact_phone,
                description,
                theme_color,
                address,
                about_us,
                // logo_url: logoUrl, etc.
            },
        });
        // Hash the admin password
        const hashedPassword = yield bcrypt.hash(adminPassword, 10);
        // Create the admin user for the new tenant
        const newAdmin = yield prismaClient_1.default.user.create({
            data: {
                name: `${name} Admin`,
                email: adminEmail,
                password: hashedPassword,
                tenantId: newTenant.id,
            },
        });
        // As per the user request, create some default data for the new tenant
        const defaultCategory = yield prismaClient_1.default.categoria.create({
            data: {
                nombre_categoria: 'General',
                descripcion: 'Default category',
                tenantId: newTenant.id,
            }
        });
        res.status(201).json({
            message: 'Tenant created successfully!',
            tenant: newTenant,
            admin: { id: newAdmin.id, email: newAdmin.email },
            defaultData: { category: defaultCategory }
        });
    }
    catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.createTenant = createTenant;
