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
exports.destroy = exports.update = exports.show = exports.store = exports.index = exports.generateQrCode = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
// ... (existing index, store, show, update, destroy functions) ...
// Generate QR Code for a table
const generateQrCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }
    try {
        const [mesa, tenant] = yield Promise.all([
            prisma_1.default.mesa.findFirst({
                where: { AND: [{ id: Number(id) }, { tenantId }] },
            }),
            prisma_1.default.tenant.findUnique({
                where: { id: tenantId },
            }),
        ]);
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found.' });
        }
        // Construct the URL. In production, you'd use your actual domain structure.
        // The frontend will be running on a different port, so we use localhost:5173 for development.
        const url = `${req.protocol}://${tenant.subdomain}.localhost:5173/mesa/${mesa.uuid}`;
        const qrCodeDataUrl = yield qrcode_1.default.toDataURL(url);
        // Save the generated QR code to the database for caching/future use
        const updatedMesa = yield prisma_1.default.mesa.update({
            where: { id: Number(id) },
            data: { codigo_qr: qrCodeDataUrl },
        });
        res.status(200).json({
            message: 'QR Code generated successfully.',
            qrCodeUrl: qrCodeDataUrl,
            table: updatedMesa,
        });
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'An error occurred while generating the QR code.' });
    }
});
exports.generateQrCode = generateQrCode;
// List all tables for the tenant
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const mesas = yield prisma_1.default.mesa.findMany({
            where: { tenantId },
            orderBy: { numero_mesa: 'asc' },
        });
        res.status(200).json(mesas);
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'An error occurred while fetching tables.' });
    }
});
exports.index = index;
// Create a new table
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        // Find the highest table number for the current tenant
        const lastTable = yield prisma_1.default.mesa.findFirst({
            where: { tenantId },
            orderBy: { numero_mesa: 'desc' },
        });
        const newTableNumber = lastTable ? lastTable.numero_mesa + 1 : 1;
        const newMesa = yield prisma_1.default.mesa.create({
            data: {
                numero_mesa: newTableNumber,
                uuid: (0, uuid_1.v4)(),
                tenantId,
                estado: 'disponible',
                status: 1,
            },
        });
        res.status(201).json(newMesa);
    }
    catch (error) {
        if (error.code === 'P2002') {
            // This case should be less likely now but is good to keep as a safeguard
            return res.status(409).json({ error: 'A table with this number already exists.' });
        }
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'An error occurred while creating the table.' });
    }
});
exports.store = store;
// Get a single table's details (e.g., for QR code generation)
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }
    try {
        const mesa = yield prisma_1.default.mesa.findFirst({
            where: {
                AND: [{ id: Number(id) }, { tenantId }],
            },
        });
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        res.status(200).json(mesa);
    }
    catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'An error occurred while fetching the table.' });
    }
});
exports.show = show;
// Update a table (e.g., change its status)
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }
    const { estado } = req.body;
    if (!estado || !['disponible', 'ocupada', 'reservada'].includes(estado)) {
        return res.status(400).json({ error: 'A valid status is required (disponible, ocupada, reservada).' });
    }
    try {
        const mesa = yield prisma_1.default.mesa.findFirst({
            where: { AND: [{ id: Number(id) }, { tenantId }] },
        });
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        const updatedMesa = yield prisma_1.default.mesa.update({
            where: { id: Number(id) },
            data: { estado },
        });
        res.status(200).json(updatedMesa);
    }
    catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ error: 'An error occurred while updating the table.' });
    }
});
exports.update = update;
// Delete a table
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }
    try {
        const mesa = yield prisma_1.default.mesa.findFirst({
            where: { AND: [{ id: Number(id) }, { tenantId }] },
        });
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        yield prisma_1.default.mesa.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'An error occurred while deleting the table.' });
    }
});
exports.destroy = destroy;
