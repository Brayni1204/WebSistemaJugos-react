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
exports.getActiveOrdersForTable = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get all active (not completed or cancelled) orders for a specific table
const getActiveOrdersForTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { uuid } = req.params;
    if (!uuid) {
        return res.status(400).json({ error: 'Table UUID is required.' });
    }
    try {
        const mesa = yield prisma_1.default.mesa.findUnique({
            where: { uuid, tenantId },
            include: {
                pedidos: {
                    where: {
                        NOT: [
                            { estado: 'completado' },
                            { estado: 'cancelado' },
                        ],
                    },
                    include: {
                        detalle_pedidos: {
                            include: {
                                producto: {
                                    select: {
                                        imageUrl: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'asc',
                    }
                }
            }
        });
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        // We can flatten the items from all active orders into one list
        const activeItems = mesa.pedidos.flatMap(pedido => pedido.detalle_pedidos);
        res.status(200).json(activeItems);
    }
    catch (error) {
        console.error('Error fetching active orders for table:', error);
        res.status(500).json({ error: 'An error occurred while fetching orders.' });
    }
});
exports.getActiveOrdersForTable = getActiveOrdersForTable;
