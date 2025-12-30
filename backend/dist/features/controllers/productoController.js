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
exports.destroy = exports.update = exports.show = exports.store = exports.publicIndex = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const cloudinary_1 = require("../../config/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search;
    const categoryId = req.query.id_categoria;
    const skip = (page - 1) * limit;
    try {
        const whereClause = {
            tenantId,
            status: 1, // Only active products for admin view
        };
        if (searchTerm) {
            whereClause.nombre_producto = {
                contains: searchTerm,
            };
        }
        if (categoryId) {
            whereClause.id_categoria = parseInt(categoryId);
        }
        const [productos, total] = yield prisma_1.default.$transaction([
            prisma_1.default.producto.findMany({
                where: whereClause,
                include: {
                    categoria: true,
                    componentes: true,
                },
                skip: skip,
                take: limit,
                orderBy: {
                    id: 'desc',
                },
            }),
            prisma_1.default.producto.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.json({
            data: productos,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});
exports.index = index;
const publicIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Show more on public pages
    const searchTerm = req.query.search;
    const categoryId = req.query.id_categoria;
    const skip = (page - 1) * limit;
    try {
        const whereClause = {
            tenantId,
            status: 1, // Only show active products publicly
        };
        if (searchTerm) {
            whereClause.nombre_producto = {
                contains: searchTerm,
            };
        }
        if (categoryId) {
            whereClause.id_categoria = parseInt(categoryId);
        }
        const [productos, total] = yield prisma_1.default.$transaction([
            prisma_1.default.producto.findMany({
                where: whereClause,
                include: {
                    categoria: true,
                },
                skip: skip,
                take: limit,
                orderBy: {
                    id: 'desc',
                },
            }),
            prisma_1.default.producto.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.json({
            data: productos,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching public products:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});
exports.publicIndex = publicIndex;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    let { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra, componenteIds, tracks_stock } = req.body;
    if (!id_categoria || !nombre_producto || !precio_venta || !precio_compra) {
        return res.status(400).json({ error: 'Category, name, sale price, and purchase price are required.' });
    }
    // Parse tracks_stock as a boolean
    const shouldTrackStock = tracks_stock === 'true';
    // Parse componenteIds from string to array of numbers
    let parsedComponenteIds = [];
    if (componenteIds && typeof componenteIds === 'string') {
        try {
            parsedComponenteIds = JSON.parse(componenteIds).map(Number);
        }
        catch (e) {
            return res.status(400).json({ error: 'componenteIds must be a valid JSON array string.' });
        }
    }
    else if (Array.isArray(componenteIds)) {
        parsedComponenteIds = componenteIds.map(Number);
    }
    let imageUrl = null;
    try {
        if (req.file) {
            imageUrl = yield (0, cloudinary_1.uploadImage)(req.file.path);
        }
        const producto = yield prisma_1.default.producto.create({
            data: {
                tenantId,
                id_categoria: parseInt(id_categoria),
                nombre_producto,
                descripcion,
                stock: shouldTrackStock ? (stock ? parseInt(stock) : 0) : 0,
                tracks_stock: shouldTrackStock,
                status: status ? parseInt(status) : 1,
                precio_venta: parseFloat(precio_venta),
                precio_compra: parseFloat(precio_compra),
                imageUrl,
                componentes: {
                    connect: parsedComponenteIds.map(id => ({ id }))
                }
            },
        });
        res.status(201).json(producto);
    }
    catch (error) {
        console.error('Error creating product:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'El nombre del producto ya existe.' });
        }
        res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
    }
    finally {
        if (req.file) {
            yield promises_1.default.unlink(req.file.path);
        }
    }
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
    }
    try {
        const producto = yield prisma_1.default.producto.findFirst({
            where: {
                AND: [{ id: parseInt(id) }, { tenantId }]
            },
            include: {
                categoria: true,
                componentes: true,
            },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json(producto);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
    }
    let { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra, componenteIds, tracks_stock } = req.body;
    const shouldTrackStock = tracks_stock === 'true';
    // Parse componenteIds from string to array of numbers
    let parsedComponenteIds = undefined;
    if (componenteIds && typeof componenteIds === 'string') {
        try {
            parsedComponenteIds = JSON.parse(componenteIds).map(Number);
        }
        catch (e) {
            return res.status(400).json({ error: 'componenteIds must be a valid JSON array string.' });
        }
    }
    else if (Array.isArray(componenteIds)) {
        parsedComponenteIds = componenteIds.map(Number);
    }
    try {
        const existingProducto = yield prisma_1.default.producto.findFirst({
            where: { AND: [{ id: parseInt(id) }, { tenantId }] },
        });
        if (!existingProducto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = yield (0, cloudinary_1.uploadImage)(req.file.path);
            // Optionally delete old image from Cloudinary here if it exists
        }
        const producto = yield prisma_1.default.producto.update({
            where: { id: parseInt(id) },
            data: {
                id_categoria: id_categoria ? parseInt(id_categoria) : undefined,
                nombre_producto,
                descripcion,
                stock: shouldTrackStock ? (stock ? parseInt(stock) : 0) : 0,
                tracks_stock: shouldTrackStock,
                status: status ? parseInt(status) : undefined,
                precio_venta: precio_venta ? parseFloat(precio_venta) : undefined,
                precio_compra: precio_compra ? parseFloat(precio_compra) : undefined,
                imageUrl,
                componentes: parsedComponenteIds ? { set: parsedComponenteIds.map(id => ({ id })) } : undefined,
            },
        });
        res.json(producto);
    }
    catch (error) {
        console.error('Error updating product:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'El nombre del producto ya existe.' });
        }
        res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
    }
    finally {
        if (req.file) {
            yield promises_1.default.unlink(req.file.path);
        }
    }
});
exports.update = update;
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
    }
    try {
        const existingProducto = yield prisma_1.default.producto.findFirst({
            where: { AND: [{ id: parseInt(id) }, { tenantId }] },
        });
        if (!existingProducto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        // Optionally delete image from Cloudinary here
        yield prisma_1.default.producto.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
    }
});
exports.destroy = destroy;
