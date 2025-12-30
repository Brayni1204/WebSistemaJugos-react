// src/features/controllers/admin/proveedorController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// GET /api/admin/proveedores
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const proveedores = await prisma.proveedor.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(proveedores);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch suppliers.' });
    }
};

// POST /api/admin/proveedores
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { name, ruc, email, phone, address } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Supplier name is required.' });
    }

    try {
        const newProveedor = await prisma.proveedor.create({
            data: {
                tenantId: tenantId!,
                name,
                ruc,
                email,
                phone,
                address,
            },
        });
        res.status(201).json(newProveedor);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A supplier with this name or RUC already exists.' });
        }
        res.status(500).json({ message: 'Failed to create supplier.' });
    }
};

// PUT /api/admin/proveedores/:id
export const update = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { name, ruc, email, phone, address } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Supplier name is required.' });
    }

    try {
        const updatedProveedor = await prisma.proveedor.update({
            where: { id: Number(id) },
            data: {
                name,
                ruc,
                email,
                phone,
                address,
            },
        });
        res.status(200).json(updatedProveedor);
    } catch (error: any) {
         if (error.code === 'P2002') {
            return res.status(409).json({ message: 'A supplier with this name or RUC already exists.' });
        }
        res.status(500).json({ message: 'Failed to update supplier.' });
    }
};

// DELETE /api/admin/proveedores/:id
export const destroy = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.proveedor.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete supplier.' });
    }
};
