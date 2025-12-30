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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/config/prisma"));
const tenantMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- Tenant Middleware Triggered ---');
    let hostname = req.hostname;
    console.log(`Initial hostname: ${hostname}`);
    console.log(`Request Origin header: ${req.headers.origin}`);
    // For cross-origin requests in development, hostname might be 'localhost'.
    // The 'Origin' header will contain the actual frontend URL with the subdomain.
    if (hostname === 'localhost' && req.headers.origin) {
        try {
            const originUrl = new URL(req.headers.origin);
            hostname = originUrl.hostname; // e.g., "chavez-tienda.localhost"
            console.log(`Hostname updated from Origin header: ${hostname}`);
        }
        catch (e) {
            // Invalid origin header, proceed with the original hostname
            console.warn('Invalid Origin header:', req.headers.origin);
        }
    }
    const parts = hostname.split('.');
    let subdomain = null;
    // Logic to extract subdomain, e.g., 'subdomain.localhost' or 'subdomain.example.com'
    if (parts.length > 1) {
        // Avoid using 'www' or the main domain part as a subdomain
        if (parts[0] !== 'www' && parts[0] !== 'localhost') {
            subdomain = parts[0];
        }
        else if (parts.length > 2 && parts[1] !== 'localhost') {
            // Handle cases like www.subdomain.example.com (less common for this app)
            subdomain = parts[1];
        }
    }
    const tenantSubdomain = subdomain || process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
    console.log(`Attempting to find tenant for subdomain: '${tenantSubdomain}'`);
    try {
        const tenant = yield prisma_1.default.tenant.findUnique({
            where: {
                subdomain: tenantSubdomain,
            },
        });
        if (!tenant) {
            console.error(`!!! TENANT NOT FOUND for subdomain '${tenantSubdomain}'. Sending 404.`);
            return res.status(404).json({ message: `Tenant '${tenantSubdomain}' not found.` });
        }
        console.log(`Tenant found: ${tenant.name} (ID: ${tenant.id})`);
        if (tenant.status !== 'ACTIVE') {
            console.error(`!!! TENANT INACTIVE: '${tenant.name}'. Sending 403.`);
            return res.status(403).json({ message: 'This site is currently inactive. Please contact support.' });
        }
        req.tenant = tenant;
        console.log('--- Tenant Middleware Success, calling next() ---');
        next();
    }
    catch (error) {
        console.error('Error in tenant middleware:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.default = tenantMiddleware;
