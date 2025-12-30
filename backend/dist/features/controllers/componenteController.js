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
exports.destroy = exports.store = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get all components for the tenant
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const componentes = yield prisma_1.default.componente.findMany({
            where: { tenantId },
            orderBy: { nombre_componente: 'asc' },
        });
        res.status(200).json(componentes);
    }
    catch (error) {
        console.error('Error fetching components:', error);
        res.status(500).json({ error: 'An error occurred while fetching components.' });
    }
});
exports.index = index;
// Create a new component
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { nombre_componente } = req.body;
    if (!nombre_componente) {
        return res.status(400).json({ error: 'Component name is required.' });
    }
    try {
        const newComponente = yield prisma_1.default.componente.create({
            data: {
                nombre_componente,
                tenantId,
                status: 1,
            },
        });
        res.status(201).json(newComponente);
    }
    catch (error) {
        console.error('Error creating component:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Un ingrediente con este nombre ya existe.' });
        }
        res.status(500).json({ message: 'An error occurred while creating the component.' });
    }
});
exports.store = store;
// Delete a component
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Component ID must be a number.' });
    }
    try {
        // Before deleting, ensure the component belongs to the correct tenant
        const componente = yield prisma_1.default.componente.findFirst({
            where: {
                AND: [{ id: Number(id) }, { tenantId }],
            },
        });
        if (!componente) {
            return res.status(404).json({ error: 'Component not found.' });
        }
        // Note: Deleting a component will automatically handle disconnecting it from all products
        // due to the many-to-many relation defined in Prisma.
        yield prisma_1.default.componente.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting component:', error);
        res.status(500).json({ error: 'An error occurred while deleting the component.' });
    }
});
exports.destroy = destroy;
