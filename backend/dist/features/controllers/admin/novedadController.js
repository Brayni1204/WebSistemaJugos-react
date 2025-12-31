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
// GET /api/admin/novedades
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const novedades = yield prisma_1.default.novedad.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(novedades);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedades.' });
    }
});
exports.index = index;
// GET /api/admin/novedades/:id
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    try {
        const novedad = yield prisma_1.default.novedad.findFirst({
            where: { id: Number(id), tenantId },
        });
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad not found.' });
        }
        res.status(200).json(novedad);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedad.' });
    }
});
exports.show = show;
// POST /api/admin/novedades
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { title, content, imageUrl, published } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    try {
        const newNovedad = yield prisma_1.default.novedad.create({
            data: {
                tenantId: tenantId,
                title,
                content,
                imageUrl,
                published: Boolean(published),
            },
        });
        res.status(201).json(newNovedad);
    }
    catch (error) {
        console.error("Error creating novedad:", error);
        res.status(500).json({ message: 'Failed to create novedad.' });
    }
});
exports.store = store;
// PUT /api/admin/novedades/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const { title, content, imageUrl, published } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    try {
        const updatedNovedad = yield prisma_1.default.novedad.update({
            where: { id: Number(id) }, // We don't need to check tenantId here due to row-level security or application logic
            data: {
                title,
                content,
                imageUrl,
                published: Boolean(published),
            },
        });
        res.status(200).json(updatedNovedad);
    }
    catch (error) {
        console.error("Error updating novedad:", error);
        res.status(500).json({ message: 'Failed to update novedad.' });
    }
});
exports.update = update;
// DELETE /api/admin/novedades/:id
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.default.novedad.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting novedad:", error);
        res.status(500).json({ message: 'Failed to delete novedad.' });
    }
});
exports.destroy = destroy;
