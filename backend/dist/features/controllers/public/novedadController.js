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
exports.show = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// GET /api/public/novedades
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const novedades = yield prisma_1.default.novedad.findMany({
            where: { tenantId, published: true },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(novedades);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch a list of novedades.' });
    }
});
exports.index = index;
// GET /api/public/novedades/:id
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    try {
        const novedad = yield prisma_1.default.novedad.findFirst({
            where: {
                id: Number(id),
                tenantId,
                published: true
            },
        });
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad not found or not published.' });
        }
        res.status(200).json(novedad);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedad.' });
    }
});
exports.show = show;
