// src/features/controllers/public/mesaController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Get all active (not completed or cancelled) orders for a specific table
export const getActiveOrdersForTable = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { uuid } = req.params;
    if (!uuid) {
        return res.status(400).json({ error: 'Table UUID is required.' });
    }

    try {
        const mesa = await prisma.mesa.findUnique({
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
                        detalle_pedidos: { // Include the items for each order
                            include: {
                                producto: { // Include the product details for each item
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

    } catch (error) {
        console.error('Error fetching active orders for table:', error);
        res.status(500).json({ error: 'An error occurred while fetching orders.' });
    }
};
