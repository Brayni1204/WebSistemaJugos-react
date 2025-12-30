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
exports.updateOrderCustomer = exports.getReceiptOrder = exports.createOrUpdateOrder = exports.getActiveOrderForTable = exports.getTables = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const uuid_1 = require("uuid");
/**
 * @swagger
 * tags:
 *   name: Waiter
 *   description: Endpoints for waiter-specific actions
 */
/**
 * @swagger
 * /api/waiter/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Waiter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mesa'
 *       500:
 *         description: Server error
 */
const getTables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const mesas = yield prisma_1.default.mesa.findMany({
            where: { tenantId },
            orderBy: { numero_mesa: 'asc' },
            include: {
                pedidos: {
                    where: {
                        estado: 'pendiente'
                    }
                }
            }
        });
        res.status(200).json(mesas);
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'An error occurred while fetching tables.' });
    }
});
exports.getTables = getTables;
/**
 * @swagger
 * /api/waiter/orders/table/{tableId}:
 *   get:
 *     summary: Get the active (pending) order for a specific table
 *     tags: [Waiter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the table
 *     responses:
 *       200:
 *         description: The pending order for the table
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: No pending order found for this table
 *       500:
 *         description: Server error
 */
const getActiveOrderForTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { tableId } = req.params;
    try {
        const order = yield prisma_1.default.pedido.findFirst({
            where: {
                mesa_id: Number(tableId),
                tenantId,
                estado: 'pendiente'
            },
            include: {
                detalle_pedidos: {
                    include: {
                        producto: true
                    }
                },
                cliente: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        if (!order) {
            return res.status(200).json(null); // Return 200 OK with null for no pending order
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error fetching active order:', error);
        res.status(500).json({ error: 'An error occurred while fetching the active order.' });
    }
});
exports.getActiveOrderForTable = getActiveOrderForTable;
/**
 * @swagger
 * /api/waiter/orders:
 *   post:
 *     summary: Create a new order or add items to an existing one
 *     tags: [Waiter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableId:
 *                 type: integer
 *               waiterId:
 *                 type: integer
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created or updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
const createOrUpdateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const { tableId, customerName, customerPhone, items } = req.body;
    const waiterId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // Assumes waiter's user object is on req
    if (!tableId || !waiterId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: tableId, waiterId, and items are required.' });
    }
    try {
        // Transaction to ensure atomicity
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Find or create a customer
            let customer = null;
            if (customerName) {
                const email = `${customerPhone || (0, uuid_1.v4)()}@tenant${tenantId}.local`;
                customer = yield tx.cliente.upsert({
                    where: { email_tenantId: { email, tenantId } },
                    update: { nombre: customerName, telefono: customerPhone },
                    create: {
                        nombre: customerName,
                        email: email,
                        telefono: customerPhone,
                        tenantId: tenantId,
                    },
                });
            }
            // 2. Find existing pending order or create a new one
            let order = yield tx.pedido.findFirst({
                where: {
                    mesa_id: tableId,
                    tenantId,
                    estado: 'pendiente'
                },
                orderBy: { created_at: 'desc' }
            });
            if (!order) {
                order = yield tx.pedido.create({
                    data: {
                        mesa_id: tableId,
                        id_user: waiterId,
                        cliente_id: customer === null || customer === void 0 ? void 0 : customer.id,
                        tenantId,
                        // Dummy values, will be recalculated
                        subtotal: 0,
                        total_pago: 0,
                        costo_delivery: 0
                    }
                });
                // Update table status to 'ocupada'
                yield tx.mesa.update({
                    where: { id: tableId },
                    data: { estado: 'ocupada' },
                });
            }
            else if (customer && !order.cliente_id) {
                // If an order exists but has no customer, assign the new one
                order = yield tx.pedido.update({
                    where: { id: order.id },
                    data: { cliente_id: customer.id }
                });
            }
            // 3. Add new items to the order
            let newItemsSubtotal = 0;
            for (const item of items) {
                const product = yield tx.producto.findUnique({ where: { id: item.productId } });
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }
                const price = Number(product.precio_venta);
                const total = price * item.quantity;
                newItemsSubtotal += total;
                yield tx.detallePedido.create({
                    data: {
                        pedido_id: order.id,
                        producto_id: item.productId,
                        nombre_producto: product.nombre_producto,
                        cantidad: item.quantity,
                        precio_unitario: price,
                        precio_total: total,
                        descripcion: item.description,
                        tenantId,
                    }
                });
            }
            // 4. Recalculate and update order totals
            const updatedOrder = yield tx.pedido.update({
                where: { id: order.id },
                data: {
                    subtotal: { increment: newItemsSubtotal },
                    total_pago: { increment: newItemsSubtotal }
                },
                include: {
                    detalle_pedidos: true,
                }
            });
            return updatedOrder;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating or updating order:', error);
        res.status(500).json({ error: 'An error occurred while processing the order.' });
    }
});
exports.createOrUpdateOrder = createOrUpdateOrder;
const getReceiptOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { orderId } = req.params;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    try {
        const order = yield prisma_1.default.pedido.findFirst({
            where: {
                id: Number(orderId),
                tenantId,
            },
            include: {
                detalle_pedidos: true,
                mesa: true,
                cliente: true,
            },
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error fetching receipt order:', error);
        res.status(500).json({ error: 'An error occurred while fetching the order.' });
    }
});
exports.getReceiptOrder = getReceiptOrder;
const updateOrderCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    const { orderId } = req.params;
    const { customerName, customerPhone } = req.body;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    if (!customerName) {
        return res.status(400).json({ error: 'Customer name is required.' });
    }
    try {
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield tx.pedido.findFirst({
                where: { id: Number(orderId), tenantId },
            });
            if (!order) {
                throw new Error('Order not found.');
            }
            let customerId;
            // If the order already has a customer, update that customer.
            if (order.cliente_id) {
                yield tx.cliente.update({
                    where: { id: order.cliente_id },
                    data: { nombre: customerName, telefono: customerPhone },
                });
                customerId = order.cliente_id;
            }
            else {
                // If the order does NOT have a customer, find or create one.
                const email = `${customerPhone || customerName.replace(/\s+/g, '').toLowerCase()}@tenant${tenantId}.local`;
                const customer = yield tx.cliente.upsert({
                    where: { email_tenantId: { email, tenantId } },
                    update: { nombre: customerName, telefono: customerPhone },
                    create: {
                        nombre: customerName,
                        email: email,
                        telefono: customerPhone,
                        tenantId: tenantId,
                    },
                });
                customerId = customer.id;
            }
            // Associate the customer with the order if it wasn't already.
            const updatedOrder = yield tx.pedido.update({
                where: { id: order.id },
                data: { cliente_id: customerId },
                include: { cliente: true },
            });
            return updatedOrder;
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error updating order customer:', error);
        res.status(500).json({ message: error.message || 'Failed to update customer.' });
    }
});
exports.updateOrderCustomer = updateOrderCustomer;
