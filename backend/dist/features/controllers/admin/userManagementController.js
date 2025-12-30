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
exports.updateUser = exports.createUser = exports.updateUserRoles = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// GET /api/admin/users
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const users = yield prisma_1.default.user.findMany({
            where: { tenantId },
            include: {
                roles: true,
            },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});
exports.index = index;
// PUT /api/admin/users/:id/roles
const updateUserRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const { roleIds } = req.body;
    if (!Array.isArray(roleIds)) {
        return res.status(400).json({ message: 'roleIds must be an array of numbers.' });
    }
    try {
        // Ensure the user being updated belongs to the same tenant
        const userToUpdate = yield prisma_1.default.user.findFirst({
            where: { id: Number(id), tenantId }
        });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found in this tenant.' });
        }
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: Number(id) },
            data: {
                roles: {
                    set: roleIds.map((id) => ({ id })),
                },
            },
            include: { roles: true },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user roles:", error);
        res.status(500).json({ message: 'Failed to update user roles.' });
    }
});
exports.updateUserRoles = updateUserRoles;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { name, email, password, pin, roleIds } = req.body;
    if (!name || !email || !password || !roleIds) {
        return res.status(400).json({ message: 'Name, email, password, and roleIds are required.' });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const hashedPin = pin ? yield bcrypt_1.default.hash(pin, 10) : null;
        const newUser = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                pin: hashedPin,
                tenantId,
                email_verified_at: new Date(), // Admins create verified users
                roles: {
                    connect: roleIds.map((id) => ({ id })),
                },
            },
            include: { roles: true },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(409).json({ message: 'A user with this email already exists in this tenant.' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const { name, email, password, pin, roleIds } = req.body;
    if (!name && !email && !password && !pin && !roleIds) {
        return res.status(400).json({ message: 'At least one field to update must be provided.' });
    }
    try {
        // Ensure the user being updated belongs to the same tenant
        const userToUpdate = yield prisma_1.default.user.findFirst({
            where: { id: Number(id), tenantId }
        });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found in this tenant.' });
        }
        const dataToUpdate = {
            name,
            email,
        };
        if (password) {
            dataToUpdate.password = yield bcrypt_1.default.hash(password, 10);
        }
        if (pin) {
            dataToUpdate.pin = yield bcrypt_1.default.hash(pin, 10);
        }
        if (roleIds && Array.isArray(roleIds)) {
            dataToUpdate.roles = {
                set: roleIds.map((id) => ({ id })),
            };
        }
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: { roles: true },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(409).json({ message: 'A user with this email already exists in this tenant.' });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});
exports.updateUser = updateUser;
