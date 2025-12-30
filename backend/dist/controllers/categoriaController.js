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
        let whereClause = { tenantId };
        if (search) {
            whereClause.nombre_categoria = {
                contains: search,
            };
        }
        const categorias = yield prismaClient_1.default.categoria.findMany({
            where: whereClause,
            orderBy: {
                id: 'asc',
            },
        });
        res.json(categorias);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { nombre_categoria, descripcion, status } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    try {
        let uploadedImageUrl = null;
        if (imageUrl) {
            const result = yield cloudinary_1.default.v2.uploader.upload(imageUrl);
            uploadedImageUrl = result.secure_url;
        }
        const categoria = yield prismaClient_1.default.categoria.create({
            data: {
                nombre_categoria,
                descripcion,
                status: parseInt(status),
                imageUrl: uploadedImageUrl,
                tenantId: tenantId,
            },
        });
        res.status(201).json(categoria);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_c = (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.includes('nombre_categoria'))) {
            return res.status(409).json({ error: 'El nombre de la categoría ya existe para este inquilino.' });
        }
        res.status(500).json({ error: 'Error al crear la categoría: ' + error.message });
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
        const categoria = yield prismaClient_1.default.categoria.findFirst({
            where: { id: parseInt(id), tenantId: tenantId },
        });
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }
        res.json(categoria);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener la categoría.' });
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
    const { nombre_categoria, descripcion, status } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    try {
        const existingCategoria = yield prismaClient_1.default.categoria.findFirst({
            where: { id: parseInt(id), tenantId: tenantId },
        });
        if (!existingCategoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }
        let uploadedImageUrl = existingCategoria.imageUrl;
        if (imageUrl) {
            if (existingCategoria.imageUrl) {
                const publicId = (_b = existingCategoria.imageUrl.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.default.v2.uploader.destroy(publicId);
                }
            }
            const result = yield cloudinary_1.default.v2.uploader.upload(imageUrl);
            uploadedImageUrl = result.secure_url;
        }
        else if (req.body.removeImage === 'true') {
            if (existingCategoria.imageUrl) {
                const publicId = (_c = existingCategoria.imageUrl.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.default.v2.uploader.destroy(publicId);
                }
            }
            uploadedImageUrl = null;
        }
        const categoria = yield prismaClient_1.default.categoria.update({
            where: { id: parseInt(id) }, // The where for update is on the unique id
            data: {
                nombre_categoria,
                descripcion,
                status: parseInt(status),
                imageUrl: uploadedImageUrl,
            },
        });
        res.json(categoria);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_e = (_d = error.meta) === null || _d === void 0 ? void 0 : _d.target) === null || _e === void 0 ? void 0 : _e.includes('nombre_categoria'))) {
            return res.status(409).json({ error: 'El nombre de la categoría ya existe para este inquilino.' });
        }
        res.status(500).json({ error: 'Error al actualizar la categoría: ' + error.message });
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
        const existingCategoria = yield prismaClient_1.default.categoria.findFirst({
            where: { id: parseInt(id), tenantId: tenantId },
        });
        if (!existingCategoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }
        if (existingCategoria.imageUrl) {
            const publicId = (_b = existingCategoria.imageUrl.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.default.v2.uploader.destroy(publicId);
            }
        }
        yield prismaClient_1.default.categoria.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría: ' + error.message });
    }
});
exports.destroy = destroy;
