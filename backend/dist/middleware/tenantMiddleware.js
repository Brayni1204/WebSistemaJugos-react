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
    try {
        let hostname = req.hostname;
        const appDomain = process.env.APP_DOMAIN; // Should be: "jugueria.techinnovats.com"
        // Handle proxy headers (Portainer/Nginx) and local development
        if (hostname === 'localhost' && req.headers.origin) {
            try {
                const originUrl = new URL(req.headers.origin);
                hostname = originUrl.hostname;
            }
            catch (e) {
                console.warn('Invalid Origin header:', req.headers.origin);
            }
        }
        let subdomain = '';
        // CORRECTED LOGIC
        // Case 1: We are exactly on the main domain (e.g., jugueria.techinnovats.com)
        if (hostname === appDomain) {
            subdomain = process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
        }
        // Case 2: We are on a subdomain (e.g., chavez-tienda.jugueria.techinnovats.com)
        else if (appDomain && hostname.endsWith(`.${appDomain}`)) {
            // Extract what is BEFORE the main domain
            const parts = hostname.split(`.${appDomain}`);
            if (parts[0]) {
                subdomain = parts[0];
            }
        }
        // Case 3: Local Development
        else if (hostname.endsWith('.localhost')) {
            subdomain = hostname.replace('.localhost', '');
        }
        // Security fallback
        if (!subdomain) {
            subdomain = process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
        }
        console.log(`Detected Hostname: ${hostname} | Extracted Subdomain: ${subdomain}`);
        // Database Lookup
        const tenant = yield prisma_1.default.tenant.findUnique({
            where: { subdomain: subdomain },
        });
        if (!tenant) {
            console.error(`!!! TENANT NOT FOUND: '${subdomain}'. Hostname was: ${hostname}`);
            return res.status(404).json({
                message: `Tenant '${subdomain}' not found.`,
                debug: { hostname, extractedSubdomain: subdomain }
            });
        }
        if (tenant.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Site is inactive.' });
        }
        // Inject tenant into the request
        req.tenant = tenant;
        next();
    }
    catch (error) {
        console.error('Error in tenant middleware:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
exports.default = tenantMiddleware;
