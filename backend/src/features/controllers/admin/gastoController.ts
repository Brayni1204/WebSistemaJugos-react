// src/features/controllers/admin/gastoController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/admin/gastos
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const gastos = await prisma.gasto.findMany({
            where: { tenantId },
            include: {
                proveedor: true,
                _count: { select: { items: true } }
            },
            orderBy: { date: 'desc' },
        });
        res.status(200).json(gastos);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
};

// POST /api/admin/gastos
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { proveedorId, date, items } = req.body; // proveedorId can be null

    if (!date || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Date and at least one item are required.' });
    }

    try {
        const newGasto = await prisma.$transaction(async (tx) => {
            // 1. Calculate total amount and prepare item data
            let totalAmount = new Decimal(0);
            const detalleGastoData = items.map((item: any) => {
                const itemTotal = new Decimal(item.quantity).times(new Decimal(item.purchase_price));
                totalAmount = totalAmount.plus(itemTotal);
                return {
                    productoId: item.productoId ? Number(item.productoId) : null,
                    description: item.description, // For generic expenses
                    quantity: Number(item.quantity),
                    purchase_price: new Decimal(item.purchase_price),
                };
            });

            // 2. Create the Gasto record
            const gasto = await tx.gasto.create({
                data: {
                    tenantId: tenantId!,
                    proveedorId: proveedorId ? Number(proveedorId) : null,
                    date: new Date(date),
                    total_amount: totalAmount,
                },
            });

            // 3. Create DetalleGasto records
            await tx.detalleGasto.createMany({
                data: detalleGastoData.map(item => ({
                    ...item,
                    gastoId: gasto.id,
                })),
            });

            // 4. Update stock only for items that are products
            for (const item of detalleGastoData) {
                if (item.productoId) { // Only update stock if it's a product
                    await tx.producto.update({
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
        });
        res.status(201).json(newGasto);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: 'Failed to create expense.' });
    }
};
