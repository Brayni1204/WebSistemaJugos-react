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
exports.destroy = exports.update = exports.show = exports.store = exports.index = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// Configure Cloudinary
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const { search } = req.query;
        const queryOptions = {
            where: { tenantId },
            include: {
                categoria: true,
            },
            orderBy: {
                id: 'desc',
            },
        };
        if (search) {
            queryOptions.where.nombre_producto = {
                contains: search,
            };
        }
        const productos = yield prismaClient_1.default.producto.findMany(queryOptions);
        res.json(productos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    try {
        let uploadedImageUrl = null;
        if (imageUrl) {
            const result = yield cloudinary_1.default.v2.uploader.upload(imageUrl);
            uploadedImageUrl = result.secure_url;
        }
        const producto = yield prismaClient_1.default.producto.create({
            data: {
                tenantId,
                id_categoria: parseInt(id_categoria),
                nombre_producto,
                descripcion,
                stock: parseInt(stock),
                status: parseInt(status),
                precio_venta: parseFloat(precio_venta),
                precio_compra: parseFloat(precio_compra),
                imageUrl: uploadedImageUrl,
            },
        });
        res.status(201).json(producto);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_c = (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.includes('nombre_producto'))) {
            return res.status(409).json({ error: 'El nombre del producto ya existe.' });
        }
        res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
    }
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const { id } = req.params;
        const producto = yield prismaClient_1.default.producto.findFirst({
            where: { id: parseInt(id), tenantId },
            include: {
                categoria: true,
            },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json(producto);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    const { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    try {
        const existingProducto = yield prismaClient_1.default.producto.findFirst({
            where: { id: parseInt(id), tenantId },
        });
        if (!existingProducto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        let uploadedImageUrl = existingProducto.imageUrl;
        if (imageUrl) {
            if (existingProducto.imageUrl) {
                const publicId = (_b = existingProducto.imageUrl.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.default.v2.uploader.destroy(publicId);
                }
            }
            const result = yield cloudinary_1.default.v2.uploader.upload(imageUrl);
            uploadedImageUrl = result.secure_url;
        }
        else if (req.body.removeImage === 'true') {
            if (existingProducto.imageUrl) {
                const publicId = (_c = existingProducto.imageUrl.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.default.v2.uploader.destroy(publicId);
                }
            }
            uploadedImageUrl = null;
        }
        const producto = yield prismaClient_1.default.producto.update({
            where: { id: parseInt(id) },
            data: {
                id_categoria: parseInt(id_categoria),
                nombre_producto,
                descripcion,
                stock: parseInt(stock),
                status: parseInt(status),
                precio_venta: parseFloat(precio_venta),
                precio_compra: parseFloat(precio_compra),
                imageUrl: uploadedImageUrl,
            },
        });
        res.json(producto);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_e = (_d = error.meta) === null || _d === void 0 ? void 0 : _d.target) === null || _e === void 0 ? void 0 : _e.includes('nombre_producto'))) {
            return res.status(409).json({ error: 'El nombre del producto ya existe.' });
        }
        res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
    }
});
exports.update = update;
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const { id } = req.params;
        const existingProducto = yield prismaClient_1.default.producto.findFirst({
            where: { id: parseInt(id), tenantId },
        });
        if (!existingProducto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        if (existingProducto.imageUrl) {
            const publicId = (_b = existingProducto.imageUrl.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.default.v2.uploader.destroy(publicId);
            }
        }
        yield prismaClient_1.default.producto.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
    }
});
exports.destroy = destroy;
