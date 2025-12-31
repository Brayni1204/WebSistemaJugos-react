"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/express.d.ts" />
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("@/api/userRoutes"));
const authRoutes_1 = __importDefault(require("@/api/authRoutes"));
const authRoutes_2 = __importDefault(require("@/api/admin/authRoutes"));
const categoriaRoutes_1 = __importDefault(require("@/api/categoriaRoutes"));
const productoRoutes_1 = __importDefault(require("@/api/productoRoutes"));
const componenteRoutes_1 = __importDefault(require("@/api/componenteRoutes"));
const resenaRoutes_1 = __importDefault(require("@/api/resenaRoutes"));
const cartRoutes_1 = __importDefault(require("@/api/cartRoutes"));
const profileRoutes_1 = __importDefault(require("@/api/profileRoutes"));
const mesaRoutes_1 = __importDefault(require("@/api/mesaRoutes"));
const orderRoutes_1 = __importDefault(require("@/api/admin/orderRoutes"));
const orderStatusRoutes_1 = __importDefault(require("@/api/admin/orderStatusRoutes"));
const tenantRoutes_1 = __importDefault(require("@/api/tenantRoutes"));
const paginaRoutes_1 = __importDefault(require("@/api/paginaRoutes"));
const categoriaRoutes_2 = __importDefault(require("@/api/public/categoriaRoutes"));
const empresaRoutes_1 = __importDefault(require("@/api/public/empresaRoutes"));
const paginaRoutes_2 = __importDefault(require("@/api/public/paginaRoutes"));
const roleRoutes_1 = __importDefault(require("@/api/admin/roleRoutes"));
const permissionRoutes_1 = __importDefault(require("@/api/admin/permissionRoutes"));
const tenantSettingsRoutes_1 = __importDefault(require("@/api/admin/tenantSettingsRoutes"));
const proveedorRoutes_1 = __importDefault(require("@/api/admin/proveedorRoutes"));
const gastoRoutes_1 = __importDefault(require("@/api/admin/gastoRoutes"));
const userManagementRoutes_1 = __importDefault(require("@/api/admin/userManagementRoutes"));
const reviewManagementRoutes_1 = __importDefault(require("@/api/admin/reviewManagementRoutes"));
const dashboardRoutes_1 = __importDefault(require("@/api/admin/dashboardRoutes"));
const novedadesRoutes_1 = __importDefault(require("@/api/admin/novedadesRoutes"));
const commentManagementRoutes_1 = __importDefault(require("@/api/admin/commentManagementRoutes"));
const mesaRoutes_2 = __importDefault(require("@/api/public/mesaRoutes"));
const orderRoutes_2 = __importDefault(require("@/api/public/orderRoutes"));
const productoRoutes_2 = __importDefault(require("@/api/public/productoRoutes"));
const novedadesRoutes_2 = __importDefault(require("@/api/public/novedadesRoutes"));
const commentRoutes_1 = __importDefault(require("@/api/commentRoutes"));
const waiterRoutes_1 = __importDefault(require("@/api/waiterRoutes"));
const tenantMiddleware_1 = __importDefault(require("@/middleware/tenantMiddleware"));
const readOnlyDemoMiddleware_1 = __importDefault(require("@/middleware/readOnlyDemoMiddleware"));
const apiKeyMiddleware_1 = require("@/middleware/apiKeyMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Provisioning routes are now protected by an API key
app.use('/api/provisioning', apiKeyMiddleware_1.validateApiKey, tenantRoutes_1.default);
// This middleware must run before all your tenant-specific routes
app.use(tenantMiddleware_1.default);
// This middleware checks if the tenant is 'demo' and restricts write operations
app.use(readOnlyDemoMiddleware_1.default);
app.get('/api/tenant-info', (req, res) => {
    if (req.tenant) {
        const { id, name, theme_color, theme_secondary_color, dark_mode_enabled, logo_url, favicon_url, hero_banner_url, description, address, contact_phone, business_email, social_links, mision, vision, delivery_cost } = req.tenant;
        res.json({
            id, name, theme_color, theme_secondary_color, dark_mode_enabled,
            logo_url, favicon_url, hero_banner_url, description, address, contact_phone, business_email, social_links,
            mision, vision, delivery_cost
        });
    }
    else {
        res.status(404).json({ message: 'Tenant information not found.' });
    }
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// WAITER SPECIFIC ROUTES
app.use('/api/waiter', waiterRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api/admin/auth', authRoutes_2.default);
app.use('/api/admin', categoriaRoutes_1.default);
app.use('/api/admin', productoRoutes_1.default);
app.use('/api/admin', componenteRoutes_1.default);
app.use('/api/admin', tenantSettingsRoutes_1.default);
app.use('/api/admin', permissionRoutes_1.default);
app.use('/api/admin', roleRoutes_1.default);
app.use('/api/admin', proveedorRoutes_1.default);
app.use('/api/admin', gastoRoutes_1.default);
app.use('/api/admin', userManagementRoutes_1.default);
app.use('/api/admin', reviewManagementRoutes_1.default);
app.use('/api/admin', commentManagementRoutes_1.default);
app.use('/api/admin', dashboardRoutes_1.default);
app.use('/api/admin', novedadesRoutes_1.default);
app.use('/api/productos', resenaRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/comments', commentRoutes_1.default);
app.use('/api/admin', mesaRoutes_1.default);
app.use('/api/admin', orderRoutes_1.default);
app.use('/api/admin', orderStatusRoutes_1.default);
app.use('/api', paginaRoutes_1.default);
app.use('/api/public', categoriaRoutes_2.default);
app.use('/api/public', empresaRoutes_1.default);
app.use('/api/public', paginaRoutes_2.default);
app.use('/api/public', productoRoutes_2.default);
app.use('/api/public', novedadesRoutes_2.default);
app.use('/api/public', orderRoutes_2.default);
app.use('/api/public', mesaRoutes_2.default);
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR HANDLER:', err.stack || err.message);
    res.status(500).send('Something broke!');
});
exports.default = app;
