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
exports.update = exports.show = exports.store = exports.index = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// List all orders for the tenant
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const whereClause = { tenantId };
        const [pedidos, total] = yield prisma_1.default.$transaction([
            prisma_1.default.pedido.findMany({
                where: whereClause,
                include: {
                    cliente: true,
                    mesa: true,
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma_1.default.pedido.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.json({
            data: pedidos,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos.' });
    }
});
exports.index = index;
// Create a new order
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { mesa_id, items, subtotal, total_pago } = req.body;
    if (!mesa_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Table ID and at least one item are required.' });
    }
    try {
        const newOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const pedido = yield tx.pedido.create({
                data: {
                    tenantId,
                    mesa_id,
                    subtotal,
                    costo_delivery: 0,
                    total_pago,
                    estado: 'pendiente',
                    metodo_entrega: 'en local',
                },
            });
            const detallePedidosData = items.map((item) => ({
                pedido_id: pedido.id,
                producto_id: item.producto_id,
                cantidad: item.quantity,
                precio_unitario: item.precio_venta,
                precio_total: item.quantity * item.precio_venta,
                nombre_producto: item.nombre_producto,
                tenantId,
            }));
            yield tx.detallePedido.createMany({
                data: detallePedidosData,
            });
            for (const item of detallePedidosData) {
                const product = yield tx.producto.findUnique({
                    where: { id: item.producto_id },
                });
                if (product && product.tracks_stock) {
                    if (product.stock < item.cantidad) {
                        throw new Error(`No hay suficiente stock para ${product.nombre_producto}. Disponible: ${product.stock}, Solicitado: ${item.cantidad}`);
                    }
                    yield tx.producto.update({
                        where: { id: item.producto_id },
                        data: { stock: { decrement: item.cantidad } },
                    });
                }
            }
            yield tx.mesa.update({
                where: { id: mesa_id },
                data: { estado: 'ocupada' },
            });
            return pedido;
        }));
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message || 'An error occurred while creating the order.' });
    }
});
exports.store = store;
// Get a single order
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Order ID must be a number.' });
    }
    try {
        const order = yield prisma_1.default.pedido.findFirst({
            where: { AND: [{ id: Number(id) }, { tenantId }] },
            include: {
                cliente: true,
                mesa: true,
                detalle_pedidos: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'An error occurred while fetching the order.' });
    }
});
exports.show = show;
// Update an order (status, items, etc.)
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant not identified.' });
    }
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ message: 'Order ID must be a number.' });
    }
    const { estado, items: newItems, subtotal, total_pago } = req.body;
    try {
        const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield tx.pedido.findFirst({
                where: { AND: [{ id: Number(id) }, { tenantId }] },
                include: { detalle_pedidos: true },
            });
            if (!order) {
                throw new Error('ORDER_NOT_FOUND');
            }
            const oldStatus = order.estado;
            const newStatus = estado || oldStatus;
            console.log(`[Order Update] Order ID: ${id}`);
            console.log(`[Order Update] Old Status: ${oldStatus}, New Status: ${newStatus}`);
            if (oldStatus === 'pendiente' && Array.isArray(newItems)) {
                const oldItemsMap = new Map(order.detalle_pedidos.map(item => [item.producto_id, item.cantidad]));
                const newItemsMap = new Map(newItems.map((item) => [item.producto_id, item.quantity]));
                const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);
                for (const productoId of allProductIds) {
                    const oldQty = oldItemsMap.get(productoId) || 0;
                    const newQty = newItemsMap.get(productoId) || 0;
                    const delta = newQty - oldQty;
                    if (delta > 0) {
                        const product = yield tx.producto.findUnique({ where: { id: productoId } });
                        if (product && product.tracks_stock) {
                            if (product.stock < delta) {
                                throw new Error(`No hay suficiente stock para ${product.nombre_producto}.`);
                            }
                            yield tx.producto.update({
                                where: { id: productoId },
                                data: { stock: { decrement: delta } },
                            });
                        }
                    }
                    else if (delta < 0) {
                        yield tx.producto.updateMany({
                            where: { id: productoId, tracks_stock: true },
                            data: { stock: { increment: Math.abs(delta) } },
                        });
                    }
                }
                yield tx.detallePedido.deleteMany({ where: { pedido_id: Number(id) } });
                yield tx.detallePedido.createMany({
                    data: newItems.map((item) => ({
                        pedido_id: Number(id),
                        producto_id: item.producto_id,
                        cantidad: item.quantity,
                        precio_unitario: item.precio_venta,
                        precio_total: item.quantity * item.precio_venta,
                        nombre_producto: item.nombre_producto,
                        tenantId,
                    })),
                });
            }
            const updatedOrderData = yield tx.pedido.update({
                where: { id: Number(id) },
                data: {
                    estado: newStatus,
                    subtotal: subtotal !== null && subtotal !== void 0 ? subtotal : order.subtotal,
                    total_pago: total_pago !== null && total_pago !== void 0 ? total_pago : order.total_pago,
                },
            });
            console.log(`[Order Update] Checking if a Venta should be created...`);
            if (newStatus === 'completado' && oldStatus !== 'completado') {
                console.log(`[Order Update] Condition met! Creating Venta record for Order ID: ${id}`);
                const venta = yield tx.venta.create({
                    data: {
                        tenantId: order.tenantId,
                        pedido_id: order.id,
                        subtotal: order.subtotal,
                        costo_delivery: order.costo_delivery,
                        total_pago: order.total_pago,
                        estado: 'completado',
                        id_user: order.id_user,
                        cliente_id: order.cliente_id,
                    }
                });
                console.log(`[Order Update] Venta record created with ID: ${venta.id}`);
                const detalleVentaData = order.detalle_pedidos.map(item => ({
                    venta_id: venta.id,
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    precio_total: item.precio_total,
                    nombre_producto: item.nombre_producto,
                    tenantId: order.tenantId,
                }));
                yield tx.detalleVenta.createMany({
                    data: detalleVentaData,
                });
                console.log(`[Order Update] DetalleVenta records created.`);
            }
            else {
                console.log(`[Order Update] Condition NOT met for creating Venta. newStatus: ${newStatus}, oldStatus: ${oldStatus}`);
            }
            if ((newStatus === 'completado' || newStatus === 'cancelado') && order.mesa_id) {
                const otherActiveOrders = yield tx.pedido.count({
                    where: {
                        mesa_id: order.mesa_id,
                        id: { not: Number(id) },
                        estado: 'pendiente',
                    },
                });
                if (otherActiveOrders === 0) {
                    yield tx.mesa.update({
                        where: { id: order.mesa_id },
                        data: { estado: 'disponible' },
                    });
                }
            }
            return updatedOrderData;
        }));
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        if (error.message === 'ORDER_NOT_FOUND') {
            return res.status(404).json({ message: 'Order not found.' });
        }
        console.error('Error updating order:', error);
        res.status(500).json({ message: error.message || 'An error occurred while updating the order.' });
    }
});
exports.update = update;
