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
const library_1 = require("@prisma/client/runtime/library");
// GET /api/admin/gastos
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const gastos = yield prisma_1.default.gasto.findMany({
            where: { tenantId },
            include: {
                proveedor: true,
                _count: { select: { items: true } }
            },
            orderBy: { date: 'desc' },
        });
        res.status(200).json(gastos);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
});
exports.index = index;
// POST /api/admin/gastos
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { proveedorId, date, items } = req.body; // proveedorId can be null
    if (!date || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Date and at least one item are required.' });
    }
    try {
        const newGasto = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Calculate total amount and prepare item data
            let totalAmount = new library_1.Decimal(0);
            const detalleGastoData = items.map((item) => {
                const itemTotal = new library_1.Decimal(item.quantity).times(new library_1.Decimal(item.purchase_price));
                totalAmount = totalAmount.plus(itemTotal);
                return {
                    productoId: item.productoId ? Number(item.productoId) : null,
                    description: item.description, // For generic expenses
                    quantity: Number(item.quantity),
                    purchase_price: new library_1.Decimal(item.purchase_price),
                };
            });
            // 2. Create the Gasto record
            const gasto = yield tx.gasto.create({
                data: {
                    tenantId: tenantId,
                    proveedorId: proveedorId ? Number(proveedorId) : null,
                    date: new Date(date),
                    total_amount: totalAmount,
                },
            });
            // 3. Create DetalleGasto records
            yield tx.detalleGasto.createMany({
                data: detalleGastoData.map(item => (Object.assign(Object.assign({}, item), { gastoId: gasto.id }))),
            });
            // 4. Update stock only for items that are products
            for (const item of detalleGastoData) {
                if (item.productoId) { // Only update stock if it's a product
                    yield tx.producto.update({
                        where: { id: item.productoId },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            }
            return gasto;
        }));
        res.status(201).json(newGasto);
    }
    catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: 'Failed to create expense.' });
    }
});
exports.store = store;
