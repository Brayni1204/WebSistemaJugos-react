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
exports.store = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get reviews for a specific product
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { productoId } = req.params;
    if (isNaN(Number(productoId))) {
        return res.status(400).json({ error: 'Product ID must be a number.' });
    }
    try {
        const resenas = yield prisma_1.default.resena.findMany({
            where: {
                AND: [
                    { productoId: Number(productoId) },
                    { tenantId },
                    { status: 'APPROVED' },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile_photo_path: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Calculate average rating
        const totalRating = resenas.reduce((sum, resena) => sum + resena.rating, 0);
        const averageRating = resenas.length > 0 ? totalRating / resenas.length : 0;
        res.status(200).json({
            resenas,
            averageRating,
            totalResenas: resenas.length,
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'An error occurred while fetching reviews.' });
    }
});
exports.index = index;
// Create a new review for a product
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // Assuming user ID is available from auth middleware
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { productoId } = req.params;
    if (isNaN(Number(productoId))) {
        return res.status(400).json({ error: 'Product ID must be a number.' });
    }
    const { rating, comment } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }
    try {
        // Check if product exists and belongs to tenant
        const producto = yield prisma_1.default.producto.findFirst({
            where: {
                AND: [{ id: Number(productoId) }, { tenantId }],
            },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        // Check if user has already reviewed this product
        const existingResena = yield prisma_1.default.resena.findUnique({
            where: {
                productoId_userId: {
                    productoId: Number(productoId),
                    userId: userId,
                },
            },
        });
        if (existingResena) {
            return res.status(409).json({ error: 'You have already reviewed this product.' });
        }
        const newResena = yield prisma_1.default.resena.create({
            data: {
                rating,
                comment,
                productoId: Number(productoId),
                userId,
                tenantId,
                status: 'PENDING',
            },
        });
        res.status(201).json(newResena);
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'An error occurred while creating the review.' });
    }
});
exports.store = store;
