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
exports.destroy = exports.update = exports.store = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// GET /api/admin/proveedores
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const proveedores = yield prisma_1.default.proveedor.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(proveedores);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch suppliers.' });
    }
});
exports.index = index;
// POST /api/admin/proveedores
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { name, ruc, email, phone, address } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Supplier name is required.' });
    }
    try {
        const newProveedor = yield prisma_1.default.proveedor.create({
            data: {
                tenantId: tenantId,
                name,
                ruc,
                email,
                phone,
                address,
            },
        });
        res.status(201).json(newProveedor);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A supplier with this name or RUC already exists.' });
        }
        res.status(500).json({ message: 'Failed to create supplier.' });
    }
});
exports.store = store;
// PUT /api/admin/proveedores/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const { name, ruc, email, phone, address } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Supplier name is required.' });
    }
    try {
        const updatedProveedor = yield prisma_1.default.proveedor.update({
            where: { id: Number(id) },
            data: {
                name,
                ruc,
                email,
                phone,
                address,
            },
        });
        res.status(200).json(updatedProveedor);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A supplier with this name or RUC already exists.' });
        }
        res.status(500).json({ message: 'Failed to update supplier.' });
    }
});
exports.update = update;
// DELETE /api/admin/proveedores/:id
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.default.proveedor.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete supplier.' });
    }
});
exports.destroy = destroy;
