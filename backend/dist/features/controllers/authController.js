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
exports.verifyWaiterPin = exports.getMe = exports.adminLogin = exports.verifyEmail = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("@/config/prisma"));
const emailService_1 = require("@/utils/emailService");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { name, email, password } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const user = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const existingUser = yield tx.user.findFirst({
                where: { email, tenantId },
                include: { cliente: true },
            });
            if (existingUser && existingUser.email_verified_at) {
                // This is a standard way to handle transaction rollback
                throw new Error('USER_EXISTS');
            }
            if (existingUser) { // User exists but is not verified
                return yield tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name,
                        password: hashedPassword,
                        verificationCode,
                        verificationCodeExpiresAt,
                        updated_at: new Date(),
                        cliente: {
                            update: {
                                where: { id: ((_a = existingUser.cliente) === null || _a === void 0 ? void 0 : _a.id) || -1 },
                                data: { nombre: name, email },
                            }
                        }
                    },
                });
            }
            else { // No user exists, create a new one
                return yield tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        tenantId,
                        email_verified_at: null,
                        verificationCode,
                        verificationCodeExpiresAt,
                        cliente: {
                            create: {
                                nombre: name,
                                email: email,
                                tenantId: tenantId,
                            },
                        },
                    },
                });
            }
        }));
        yield (0, emailService_1.sendVerificationEmail)(user.email, user.name, verificationCode);
        res.status(202).json({
            message: 'Registro exitoso. Por favor, verifica tu email para activar tu cuenta.',
            userEmail: user.email,
        });
    }
    catch (error) {
        if (error.message === 'USER_EXISTS') {
            return res.status(409).json({ error: 'Ya existe un usuario verificado con este email.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Algo salió mal durante el registro.' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { email, password } = req.body;
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
                tenantId,
            },
            include: { cliente: true }, // Include cliente profile
        });
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }
        if (!user.email_verified_at) {
            return res.status(403).json({ error: 'Por favor, verifica tu email para iniciar sesión.' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Inicio de sesión exitoso.', token, user: user });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Algo salió mal durante el inicio de sesión.' });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: 'Email y código de verificación son requeridos.' });
    }
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: { email, tenantId },
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        if (user.email_verified_at) {
            return res.status(400).json({ error: 'Tu email ya ha sido verificado.' });
        }
        if (user.verificationCode !== code) {
            return res.status(401).json({ error: 'Código de verificación inválido.' });
        }
        if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
            return res.status(401).json({ error: 'Código de verificación expirado. Por favor, solicita uno nuevo.' });
        }
        // Verify email
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                email_verified_at: new Date(),
                verificationCode: null,
                verificationCodeExpiresAt: null,
            },
            include: { cliente: true }, // Include cliente profile
        });
        const token = jsonwebtoken_1.default.sign({ userId: updatedUser.id, tenantId: updatedUser.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Email verificado exitosamente.', token, user: updatedUser });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Algo salió mal durante la verificación del email.' });
    }
});
exports.verifyEmail = verifyEmail;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { email, password } = req.body;
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
                tenantId,
            },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                },
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        // Check if the user has a role named 'Admin'
        const isAdmin = user.roles.some(role => role.name === 'Admin');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Acceso prohibido: No es un usuario administrador.' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            tenantId: user.tenantId,
            roles: user.roles.map(role => role.name),
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Admin ha iniciado sesión exitosamente.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles, // Return the full role objects with permissions
            }
        });
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Algo salió mal durante el inicio de sesión del administrador.' });
    }
});
exports.adminLogin = adminLogin;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    // The user object is attached by the authenticateUser middleware
    // We just need to return it.
    res.status(200).json(user);
});
exports.getMe = getMe;
const verifyWaiterPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { pin } = req.body;
    if (!pin) {
        return res.status(400).json({ error: 'PIN is required.' });
    }
    try {
        const waiters = yield prisma_1.default.user.findMany({
            where: {
                tenantId,
                pin: {
                    not: null,
                },
                roles: {
                    some: {
                        name: 'Mozo',
                    },
                },
            },
            include: {
                roles: true,
            }
        });
        if (waiters.length === 0) {
            return res.status(404).json({ error: 'No waiters with configured PINs found.' });
        }
        let authenticatedUser = null;
        for (const waiter of waiters) {
            // The pin in the DB must be hashed. If it's not, this will fail.
            const isMatch = yield bcrypt_1.default.compare(pin, waiter.pin);
            if (isMatch) {
                authenticatedUser = waiter;
                break;
            }
        }
        if (!authenticatedUser) {
            return res.status(401).json({ error: 'Invalid PIN.' });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: authenticatedUser.id,
            tenantId: authenticatedUser.tenantId,
            roles: authenticatedUser.roles.map(role => role.name),
        }, process.env.JWT_SECRET, { expiresIn: '15m' } // Short-lived token for taking an order
        );
        res.json({
            message: 'PIN verified successfully.',
            token,
            user: {
                id: authenticatedUser.id,
                name: authenticatedUser.name,
                email: authenticatedUser.email,
                roles: authenticatedUser.roles,
            },
        });
    }
    catch (error) {
        console.error('Waiter PIN verification error:', error);
        res.status(500).json({ error: 'An error occurred during PIN verification.' });
    }
});
exports.verifyWaiterPin = verifyWaiterPin;
