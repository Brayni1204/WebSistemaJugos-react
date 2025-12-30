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
exports.destroy = exports.update = exports.store = exports.show = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// GET /api/admin/roles
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const roles = yield prisma_1.default.role.findMany({
            where: { tenantId },
            include: { _count: { select: { users: true, permissions: true } } },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles.' });
    }
});
exports.index = index;
// GET /api/admin/roles/:id
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    try {
        const role = yield prisma_1.default.role.findFirst({
            where: { id: Number(id), tenantId },
            include: { permissions: true },
        });
        if (!role) {
            return res.status(404).json({ error: 'Role not found.' });
        }
        res.status(200).json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch role.' });
    }
});
exports.show = show;
// POST /api/admin/roles
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Role name is required.' });
    }
    try {
        const newRole = yield prisma_1.default.role.create({
            data: {
                name,
                tenantId: tenantId,
            },
        });
        res.status(201).json(newRole);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A role with this name already exists.' });
        }
        res.status(500).json({ error: 'Failed to create role.' });
    }
});
exports.store = store;
// PUT /api/admin/roles/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const { name, permissionIds } = req.body; // Expect an array of permission IDs
    if (!name || !Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'Role name and an array of permissionIds are required.' });
    }
    try {
        const updatedRole = yield prisma_1.default.role.update({
            where: { id: Number(id) },
            data: {
                name,
                permissions: {
                    set: permissionIds.map((id) => ({ id })),
                },
            },
            include: { permissions: true },
        });
        res.status(200).json(updatedRole);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update role.' });
    }
});
exports.update = update;
// DELETE /api/admin/roles/:id
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    // Prevent deletion of core 'Admin' role
    const role = yield prisma_1.default.role.findFirst({ where: { id: Number(id), tenantId } });
    if ((role === null || role === void 0 ? void 0 : role.name) === 'Admin') {
        return res.status(403).json({ error: "The 'Admin' role cannot be deleted." });
    }
    try {
        yield prisma_1.default.role.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete role.' });
    }
});
exports.destroy = destroy;
