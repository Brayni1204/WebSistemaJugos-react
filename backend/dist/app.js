"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./types/express.d.ts" />
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoriaRoutes_1 = __importDefault(require("./routes/categoriaRoutes"));
const productoRoutes_1 = __importDefault(require("./routes/productoRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const paginaRoutes_1 = __importDefault(require("./routes/paginaRoutes"));
const tenantMiddleware_1 = __importDefault(require("./middleware/tenantMiddleware"));
const readOnlyDemoMiddleware_1 = __importDefault(require("./middleware/readOnlyDemoMiddleware"));
const apiKeyMiddleware_1 = require("./middleware/apiKeyMiddleware");
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
        const { id, name, theme_color, logo_url, description, address, contact_phone, business_email, social_links } = req.tenant;
        res.json({ id, name, theme_color, logo_url, description, address, contact_phone, business_email, social_links });
    }
    else {
        res.status(404).json({ message: 'Tenant information not found.' });
    }
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', categoriaRoutes_1.default);
app.use('/api/admin', productoRoutes_1.default);
app.use('/api', paginaRoutes_1.default);
exports.default = app;
