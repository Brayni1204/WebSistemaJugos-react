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
exports.getPublicPages = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const getPublicPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const paginas = yield prisma_1.default.pagina.findMany({
            where: {
                tenantId: tenantId,
                status: 1, // Assuming 1 is 'published'
            },
            include: {
                subtitulos: {
                    select: {
                        id: true,
                        titulo_subtitulo: true,
                        resumen: true,
                        image: {
                            select: {
                                url: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
        res.json(paginas);
    }
    catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ error: 'Error fetching pages.' });
    }
});
exports.getPublicPages = getPublicPages;
