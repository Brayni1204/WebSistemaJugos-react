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
const client_1 = require("@/generated/prisma/client");
const cloudinary_1 = require("../../config/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const prisma = new client_1.PrismaClient();
// Corresponds to GET /
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is missing from request.' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search;
    const skip = (page - 1) * limit;
    try {
        const whereClause = {
            tenantId: Number(tenantId),
        };
        if (searchTerm) {
            whereClause.nombre_categoria = {
                contains: searchTerm,
            };
        }
        const total = yield prisma.categoria.count({ where: whereClause });
        const categories = yield prisma.categoria.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: {
                id: 'desc',
            },
        });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            data: categories,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'An error occurred while fetching categories.' });
    }
});
exports.index = index;
// Corresponds to GET /:id
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
    }
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is missing from request.' });
    }
    try {
        const category = yield prisma.categoria.findFirst({
            where: {
                AND: [
                    { id: Number(id) },
                    { tenantId: Number(tenantId) }
                ]
            },
        });
        if (category) {
            res.status(200).json(category);
        }
        else {
            res.status(404).json({ error: 'Category not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the category.' });
    }
});
exports.show = show;
// Corresponds to POST /
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { nombre_categoria, descripcion } = req.body;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId || !nombre_categoria) {
        return res.status(400).json({ error: 'Tenant ID and category name are required.' });
    }
    let imageUrl = null;
    try {
        if (req.file) {
            imageUrl = yield (0, cloudinary_1.uploadImage)(req.file.path);
        }
        const newCategory = yield prisma.categoria.create({
            data: {
                nombre_categoria,
                descripcion,
                imageUrl,
                tenantId: Number(tenantId),
                status: 1, // Default status
            },
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        console.error(error);
        // Check for unique constraint violation
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A category with this name already exists for this tenant.' });
        }
        res.status(500).json({ error: 'An error occurred while creating the category.' });
    }
    finally {
        if (req.file) {
            yield promises_1.default.unlink(req.file.path); // Clean up the temporary file
        }
    }
});
exports.store = store;
// Corresponds to PUT /:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
    }
    const { nombre_categoria, descripcion, status } = req.body;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is missing from request.' });
    }
    try {
        const category = yield prisma.categoria.findFirst({
            where: {
                AND: [
                    { id: Number(id) },
                    { tenantId: Number(tenantId) }
                ]
            }
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = yield (0, cloudinary_1.uploadImage)(req.file.path);
        }
        const updatedCategory = yield prisma.categoria.update({
            where: { id: Number(id) },
            data: {
                nombre_categoria,
                descripcion,
                status: status ? Number(status) : undefined,
                imageUrl, // This will be the new Cloudinary URL or undefined
            },
        });
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A category with this name already exists for this tenant.' });
        }
        res.status(500).json({ error: 'An error occurred while updating the category.' });
    }
    finally {
        if (req.file) {
            yield promises_1.default.unlink(req.file.path);
        }
    }
});
exports.update = update;
// Corresponds to DELETE /:id
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
    }
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is missing from request.' });
    }
    try {
        // First, verify the category belongs to the tenant before deleting
        const category = yield prisma.categoria.findFirst({
            where: {
                AND: [
                    { id: Number(id) },
                    { tenantId: Number(tenantId) }
                ]
            }
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or you do not have permission to delete it.' });
        }
        // TODO: Delete image from Cloudinary before deleting the record
        yield prisma.categoria.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the category.' });
    }
});
exports.destroy = destroy;
