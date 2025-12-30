// src/features/controllers/public/orderController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Create a new order from a public QR code scan
export const placeOrder = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { table_uuid, items, subtotal, total_pago } = req.body;

    if (!table_uuid || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Table UUID and at least one item are required.' });
    }

    try {
        const mesa = await prisma.mesa.findUnique({
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

        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. Create the Pedido record
            const pedido = await tx.pedido.create({
                data: {
                    tenantId,
                    mesa_id: mesa.id,
                    subtotal: new Decimal(subtotal),
                    costo_delivery: 0,
                    total_pago: new Decimal(total_pago),
                    estado: 'pendiente', // Orders from QR start as 'pendiente'
                    metodo_entrega: 'en local',
                },
            });

            // 2. Create the DetallePedido records
            const detallePedidosData = items.map((item: any) => ({
                pedido_id: pedido.id,
                producto_id: item.id, // Assuming the item passed in has the product 'id'
                cantidad: item.quantity,
                precio_unitario: new Decimal(item.precio_venta),
                precio_total: new Decimal(item.quantity * item.precio_venta),
                nombre_producto: item.nombre_producto,
                tenantId,
            }));

            await tx.detallePedido.createMany({
                data: detallePedidosData,
            });

            // 3. Check stock and then update stock
            for (const item of detallePedidosData) {
                if (item.producto_id) { // Use item.producto_id here
                    const product = await tx.producto.findUnique({
                        where: { id: item.producto_id }, // Use item.producto_id here
                    });

                    if (product && product.tracks_stock) {
                        if (product.stock < item.cantidad) { // Use item.cantidad here
                            throw new Error(`No hay suficiente stock para ${product.nombre_producto}. Disponible: ${product.stock}, Solicitado: ${item.cantidad}`); // Use item.cantidad here
                        }
                        await tx.producto.update({
                            where: { id: item.producto_id }, // Use item.producto_id here
                            data: { stock: { decrement: item.cantidad } }, // Use item.cantidad here
                        });
                    }
                }
            }

            // 4. Update the Mesa status to 'ocupada'
            if (mesa.estado === 'disponible') {
                await tx.mesa.update({
                    where: { id: mesa.id },
                    data: { estado: 'ocupada' },
                });
            }

            return pedido;
        });

        res.status(201).json(newOrder);

    } catch (error) {
        console.error('Error creating public order:', error);
        res.status(500).json({ error: 'An error occurred while creating the order.' });
    }
};
