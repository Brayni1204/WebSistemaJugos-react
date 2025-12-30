"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readOnlyDemoMiddleware = (req, res, next) => {
    const tenant = req.tenant;
    const method = req.method;
    const isDemoTenant = (tenant === null || tenant === void 0 ? void 0 : tenant.subdomain) === (process.env.DEMO_TENANT_SUBDOMAIN || 'demo');
    const isReadOnlyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (isDemoTenant && isReadOnlyMethod) {
        return res.status(403).json({
            message: 'This is a demo site. Write operations (create, update, delete) are not allowed.'
        });
    }
    next();
};
exports.default = readOnlyDemoMiddleware;
