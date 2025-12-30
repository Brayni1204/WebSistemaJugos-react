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
exports.placeOrder = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const library_1 = require("@prisma/client/runtime/library");
// Create a new order from a public QR code scan
const placeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { table_uuid, items, subtotal, total_pago } = req.body;
    if (!table_uuid || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Table UUID and at least one item are required.' });
    }
    try {
        const mesa = yield prisma_1.default.mesa.findUnique({
            where: { uuid: table_uuid, tenantId: tenantId },
        });
        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        if (mesa.estado !== 'disponible') {
            // This is a business logic decision. For now, we allow adding orders to an occupied table.
            // You might want to change this to return an error:
            // return res.status(409).json({ error: 'This table is currently occupied.' });
        }
        const newOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create the Pedido record
            const pedido = yield tx.pedido.create({
                data: {
                    tenantId,
                    mesa_id: mesa.id,
                    subtotal: new library_1.Decimal(subtotal),
                    costo_delivery: 0,
                    total_pago: new library_1.Decimal(total_pago),
                    estado: 'pendiente', // Orders from QR start as 'pendiente'
                    metodo_entrega: 'en local',
                },
            });
            // 2. Create the DetallePedido records
            const detallePedidosData = items.map((item) => ({
                pedido_id: pedido.id,
                producto_id: item.id, // Assuming the item passed in has the product 'id'
                cantidad: item.quantity,
                precio_unitario: new library_1.Decimal(item.precio_venta),
                precio_total: new library_1.Decimal(item.quantity * item.precio_venta),
                nombre_producto: item.nombre_producto,
                tenantId,
            }));
            yield tx.detallePedido.createMany({
                data: detallePedidosData,
            });
            // 3. Check stock and then update stock
            for (const item of detallePedidosData) {
                if (item.producto_id) { // Use item.producto_id here
                    const product = yield tx.producto.findUnique({
                        where: { id: item.producto_id }, // Use item.producto_id here
                    });
                    if (product && product.tracks_stock) {
                        if (product.stock < item.cantidad) { // Use item.cantidad here
                            throw new Error(`No hay suficiente stock para ${product.nombre_producto}. Disponible: ${product.stock}, Solicitado: ${item.cantidad}`); // Use item.cantidad here
                        }
                        yield tx.producto.update({
                            where: { id: item.producto_id }, // Use item.producto_id here
                            data: { stock: { decrement: item.cantidad } }, // Use item.cantidad here
                        });
                    }
                }
            }
            // 4. Update the Mesa status to 'ocupada'
            if (mesa.estado === 'disponible') {
                yield tx.mesa.update({
                    where: { id: mesa.id },
                    data: { estado: 'ocupada' },
                });
            }
            return pedido;
        }));
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error('Error creating public order:', error);
        res.status(500).json({ error: 'An error occurred while creating the order.' });
    }
});
exports.placeOrder = placeOrder;
