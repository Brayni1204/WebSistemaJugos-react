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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("@/config/prisma"));
const waiterAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- Waiter Auth Middleware Triggered ---');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('!!! No Authorization header with Bearer token found.');
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];
    console.log(`Token received: ${token}`);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        const user = yield prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: {
                roles: true,
            },
        });
        // 1. Check if user exists
        if (!user) {
            console.error(`!!! User not found for ID: ${decoded.userId}`);
            return res.status(401).json({ message: 'User not found.' });
        }
        console.log(`User found: ${user.name}`);
        // 2. Check if the user has the 'Mozo' role
        const isWaiter = user.roles.some(role => role.name === 'Mozo');
        if (!isWaiter) {
            console.error(`!!! User ${user.name} does not have 'Mozo' role.`);
            return res.status(403).json({ message: 'Access denied. Waiter role required.' });
        }
        console.log(`User role check passed.`);
        // 3. Attach user to the request
        req.user = user;
        // Assuming a tenant resolution middleware runs before this one and attaches the tenant
        if (!req.tenant) {
            console.warn('!!! Tenant object not found on request, attempting to find it now.');
            const tenant = yield prisma_1.default.tenant.findUnique({ where: { id: decoded.tenantId } });
            if (!tenant) {
                console.error(`!!! Tenant not found for ID: ${decoded.tenantId}`);
                return res.status(401).json({ message: 'Tenant not found for this user.' });
            }
            req.tenant = tenant;
        }
        console.log('--- Waiter Auth Middleware Success, calling next() ---');
        next();
    }
    catch (error) {
        console.error('!!! Error in waiter auth middleware:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Session expired. Please enter PIN again.', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
});
exports.default = waiterAuthMiddleware;
