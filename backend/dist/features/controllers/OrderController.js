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
exports.updateOrderStatus = exports.getOrders = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try { // Outer try block
        console.log("Entering getOrders function (OUTER TRY)");
        const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant not identified.' });
        }
        try { // Original try block
            console.log("Inside try block of getOrders (INNER TRY)");
            const { page = '1', limit = '10', estado, search } = req.query;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            let whereClause = { tenantId };
            if (estado) {
                whereClause.estado = estado;
            }
            if (search) {
                const searchString = search;
                const searchNumber = parseInt(searchString, 10);
                whereClause.OR = [
                    { cliente: { nombre: { contains: searchString, mode: 'insensitive' } } },
                ];
                if (!isNaN(searchNumber)) {
                    whereClause.OR.push({ id: { equals: searchNumber } });
                }
            }
            const orders = yield prisma_1.default.pedido.findMany({
                where: whereClause,
                orderBy: {
                    created_at: 'desc',
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            });
            const totalOrders = yield prisma_1.default.pedido.count({
                where: whereClause,
            });
            res.json({
                data: orders,
                pagination: {
                    total: totalOrders,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalOrders / limitNum),
                },
            });
        }
        catch (innerError) { // Original catch block
            console.error('ERROR IN GETORDERS CATCH BLOCK (INNER):', innerError);
            const typedError = innerError;
            res.status(500).json({
                error: 'Error fetching orders',
                message: typedError.message,
                code: typedError.code,
                meta: typedError.meta,
                stack: typedError.stack,
            });
        }
    }
    catch (outerError) { // New outer catch block
        console.error('ERROR IN GETORDERS CATCH BLOCK (OUTER):', outerError);
        const typedError = outerError;
        res.status(500).json({
            error: 'Error fetching orders (outer catch)',
            message: typedError.message,
            code: typedError.code,
            meta: typedError.meta,
            stack: typedError.stack,
        });
    }
});
exports.getOrders = getOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) {
        return res.status(400).json({ message: 'Estado is required.' });
    }
    try {
        const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield tx.pedido.findFirst({
                where: { id: parseInt(id), tenantId: tenantId },
                include: { detalle_pedidos: true },
            });
            if (!order) {
                throw new Error('ORDER_NOT_FOUND');
            }
            const oldStatus = order.estado;
            const newStatus = estado;
            const updatedOrderData = yield tx.pedido.update({
                where: { id: parseInt(id) },
                data: { estado: newStatus },
            });
            // If status changes to 'cancelado', restore stock
            if (newStatus === 'cancelado' && oldStatus !== 'cancelado') {
                for (const item of order.detalle_pedidos) {
                    yield tx.producto.updateMany({
                        where: { id: item.producto_id, tracks_stock: true },
                        data: { stock: { increment: item.cantidad } },
                    });
                }
            }
            // If status changes to 'completado', create a Sale (Venta) record
            if (newStatus === 'completado' && oldStatus !== 'completado') {
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
            }
            // If the order is completed or cancelled, check if the table should be freed
            if ((newStatus === 'completado' || newStatus === 'cancelado') && order.mesa_id) {
                const otherActiveOrders = yield tx.pedido.count({
                    where: {
                        mesa_id: order.mesa_id,
                        id: { not: parseInt(id) },
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
        res.json(updatedOrder);
    }
    catch (error) {
        if (error.message === 'ORDER_NOT_FOUND') {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.status(500).json({ message: 'Error al actualizar el estado del pedido.' });
    }
});
exports.updateOrderStatus = updateOrderStatus;
