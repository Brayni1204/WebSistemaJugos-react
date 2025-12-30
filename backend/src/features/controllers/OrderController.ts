import { Request, Response } from 'express';
import prisma from '@/config/prisma';

export const getOrders = async (req: Request, res: Response) => {
  try { // Outer try block
    console.log("Entering getOrders function (OUTER TRY)");
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified.' });
    }

    try { // Original try block
      console.log("Inside try block of getOrders (INNER TRY)");
      const { page = '1', limit = '10', estado, search } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      let whereClause: any = { tenantId };
      if (estado) {
        whereClause.estado = estado as string;
      }
      
      if (search) {
          const searchString = search as string;
          const searchNumber = parseInt(searchString, 10);

          whereClause.OR = [
              { cliente: { nombre: { contains: searchString, mode: 'insensitive' } } },
          ];

          if (!isNaN(searchNumber)) {
              whereClause.OR.push({ id: { equals: searchNumber } });
          }
      }

      const orders = await prisma.pedido.findMany({
        where: whereClause,
        orderBy: {
          created_at: 'desc',
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });

      const totalOrders = await prisma.pedido.count({
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
    } catch (innerError) { // Original catch block
      console.error('ERROR IN GETORDERS CATCH BLOCK (INNER):', innerError);
      const typedError = innerError as any;
      res.status(500).json({
          error: 'Error fetching orders',
          message: typedError.message,
          code: typedError.code,
          meta: typedError.meta,
          stack: typedError.stack,
      });
    }
  } catch (outerError) { // New outer catch block
    console.error('ERROR IN GETORDERS CATCH BLOCK (OUTER):', outerError);
    const typedError = outerError as any;
    res.status(500).json({
        error: 'Error fetching orders (outer catch)',
        message: typedError.message,
        code: typedError.code,
        meta: typedError.meta,
        stack: typedError.stack,
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified.' });
    }
  
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ message: 'Estado is required.' });
    }
  
    try {
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.pedido.findFirst({
                where: { id: parseInt(id), tenantId: tenantId },
                include: { detalle_pedidos: true },
            });
        
            if (!order) {
                throw new Error('ORDER_NOT_FOUND');
            }
            
            const oldStatus = order.estado;
            const newStatus = estado;
        
            const updatedOrderData = await tx.pedido.update({
                where: { id: parseInt(id) },
                data: { estado: newStatus },
            });

            // If status changes to 'cancelado', restore stock
            if (newStatus === 'cancelado' && oldStatus !== 'cancelado') {
                for (const item of order.detalle_pedidos) {
                    await tx.producto.updateMany({
                        where: { id: item.producto_id, tracks_stock: true },
                        data: { stock: { increment: item.cantidad } },
                    });
                }
            }

            // If status changes to 'completado', create a Sale (Venta) record
            if (newStatus === 'completado' && oldStatus !== 'completado') {
                 const venta = await tx.venta.create({
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

                await tx.detalleVenta.createMany({
                    data: detalleVentaData,
                });
            }

            // If the order is completed or cancelled, check if the table should be freed
            if ((newStatus === 'completado' || newStatus === 'cancelado') && order.mesa_id) {
                const otherActiveOrders = await tx.pedido.count({
                    where: {
                        mesa_id: order.mesa_id,
                        id: { not: parseInt(id) },
                        estado: 'pendiente',
                    },
                });

                if (otherActiveOrders === 0) {
                    await tx.mesa.update({
                        where: { id: order.mesa_id },
                        data: { estado: 'disponible' },
                    });
                }
            }
            return updatedOrderData;
        });
  
      res.json(updatedOrder);
    } catch (error: any) {
        if (error.message === 'ORDER_NOT_FOUND') {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
      res.status(500).json({ message: 'Error al actualizar el estado del pedido.' });
    }
  };