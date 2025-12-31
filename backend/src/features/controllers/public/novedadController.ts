// src/features/controllers/public/novedadController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// GET /api/public/novedades
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const novedades = await prisma.novedad.findMany({
            where: { tenantId, published: true },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(novedades);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch a list of novedades.' });
    }
};

// GET /api/public/novedades/:id
export const show = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    try {
        const novedad = await prisma.novedad.findFirst({
            where: { 
                id: Number(id), 
                tenantId,
                published: true 
            },
        });
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad not found or not published.' });
        }
        res.status(200).json(novedad);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedad.' });
    }
}
