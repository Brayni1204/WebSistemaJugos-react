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
exports.updateStatus = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const client_1 = require("@/generated/prisma/client");
// GET /api/admin/reviews
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { status } = req.query; // Filter by status (e.g., ?status=PENDING)
    try {
        const whereClause = { tenantId };
        if (status && Object.values(client_1.ReviewStatus).includes(status)) {
            whereClause.status = status;
        }
        const reviews = yield prisma_1.default.resena.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true } },
                producto: { select: { nombre_producto: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error('Error fetching reviews for admin:', error);
        res.status(500).json({ error: 'An error occurred while fetching reviews.' });
    }
});
exports.index = index;
// PUT /api/admin/reviews/:id/status
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !Object.values(client_1.ReviewStatus).includes(status)) {
        return res.status(400).json({ error: 'A valid status (APPROVED, REJECTED) is required.' });
    }
    try {
        // First, verify the review belongs to the current tenant
        const reviewToUpdate = yield prisma_1.default.resena.findFirst({
            where: {
                id: Number(id),
                tenantId: tenantId,
            }
        });
        if (!reviewToUpdate) {
            return res.status(404).json({ error: 'Review not found in this tenant.' });
        }
        const updatedReview = yield prisma_1.default.resena.update({
            where: { id: Number(id) },
            data: { status: status },
        });
        res.status(200).json(updatedReview);
    }
    catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ error: 'An error occurred while updating review status.' });
    }
});
exports.updateStatus = updateStatus;
