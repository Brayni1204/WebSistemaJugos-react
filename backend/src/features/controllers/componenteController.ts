// src/features/controllers/componenteController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Get all components for the tenant
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    try {
        const componentes = await prisma.componente.findMany({
            where: { tenantId },
            orderBy: { nombre_componente: 'asc' },
        });
        res.status(200).json(componentes);
    } catch (error) {
        console.error('Error fetching components:', error);
        res.status(500).json({ error: 'An error occurred while fetching components.' });
    }
};

// Create a new component
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { nombre_componente } = req.body;
    if (!nombre_componente) {
        return res.status(400).json({ error: 'Component name is required.' });
    }

    try {
        const newComponente = await prisma.componente.create({
            data: {
                nombre_componente,
                tenantId,
                status: 1,
            },
        });
        res.status(201).json(newComponente);
    } catch (error: any) {
        console.error('Error creating component:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Un ingrediente con este nombre ya existe.' });
        }
        res.status(500).json({ message: 'An error occurred while creating the component.' });
    }
};

// Delete a component
export const destroy = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Component ID must be a number.' });
    }

    try {
        // Before deleting, ensure the component belongs to the correct tenant
        const componente = await prisma.componente.findFirst({
            where: {
                AND: [{ id: Number(id) }, { tenantId }],
            },
        });

        if (!componente) {
            return res.status(404).json({ error: 'Component not found.' });
        }
        
        // Note: Deleting a component will automatically handle disconnecting it from all products
        // due to the many-to-many relation defined in Prisma.

        await prisma.componente.delete({
            where: { id: Number(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting component:', error);
        res.status(500).json({ error: 'An error occurred while deleting the component.' });
    }
};
