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
exports.getOrders = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get current user's profile and client data
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    try {
        const userProfile = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                created_at: true,
                updated_at: true,
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        telefono: true,
                    },
                },
            },
        });
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }
        res.status(200).json(userProfile);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'An error occurred while fetching the profile.' });
    }
});
exports.getProfile = getProfile;
// Update current user's profile and client data
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { name, email, telefono, apellidos } = req.body; // Assuming email might be updated, though it's complex
    try {
        // Find existing user and client profile
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { cliente: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Check if new email is already taken by another user in the same tenant (if email is changing)
        if (email && email !== user.email) {
            const emailExists = yield prisma_1.default.user.findFirst({
                where: { email, tenantId, id: { not: userId } },
            });
            if (emailExists) {
                return res.status(409).json({ error: 'Email already in use by another account.' });
            }
        }
        const updatedUser = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update User table
            const updatedUserRecord = yield tx.user.update({
                where: { id: userId },
                data: {
                    name: name || user.name,
                    email: email || user.email,
                    updated_at: new Date(),
                },
            });
            // Update Cliente table if it exists, or create if not (should not happen after registration fix)
            if (user.cliente) {
                yield tx.cliente.update({
                    where: { id: user.cliente.id },
                    data: {
                        nombre: name || user.cliente.nombre,
                        apellidos: apellidos !== null && apellidos !== void 0 ? apellidos : user.cliente.apellidos,
                        telefono: telefono !== null && telefono !== void 0 ? telefono : user.cliente.telefono,
                        email: email || user.cliente.email, // Sync client email with user email
                    },
                });
            }
            else {
                // This case should ideally not happen if registration is fixed, but as a fallback
                yield tx.cliente.create({
                    data: {
                        user_id: updatedUserRecord.id, // Corrected from userId to user_id
                        nombre: name || updatedUserRecord.name,
                        email: updatedUserRecord.email,
                        tenantId: updatedUserRecord.tenantId,
                        apellidos,
                        telefono,
                    },
                });
            }
            return updatedUserRecord;
        }));
        res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'An error occurred while updating the profile.' });
    }
});
exports.updateProfile = updateProfile;
// Get current user's orders
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    try {
        const orders = yield prisma_1.default.pedido.findMany({
            where: { id_user: userId, tenantId },
            include: {
                detalle_pedidos: {
                    include: { producto: true },
                },
                mesa: true,
                estado_pedidos: {
                    orderBy: { created_at: 'desc' },
                    take: 1, // Only get the latest status
                },
            },
            orderBy: { created_at: 'desc' },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'An error occurred while fetching orders.' });
    }
});
exports.getOrders = getOrders;
