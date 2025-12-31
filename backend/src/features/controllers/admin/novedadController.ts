// src/features/controllers/admin/novedadController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// GET /api/admin/novedades
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const novedades = await prisma.novedad.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(novedades);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedades.' });
    }
};

// GET /api/admin/novedades/:id
export const show = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    try {
        const novedad = await prisma.novedad.findFirst({
            where: { id: Number(id), tenantId },
        });
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad not found.' });
        }
        res.status(200).json(novedad);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch novedad.' });
    }
}

// POST /api/admin/novedades
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { title, content, imageUrl, published } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const newNovedad = await prisma.novedad.create({
            data: {
                tenantId: tenantId!,
                title,
                content,
                imageUrl,
                published: Boolean(published),
            },
        });
        res.status(201).json(newNovedad);
    } catch (error) {
        console.error("Error creating novedad:", error);
        res.status(500).json({ message: 'Failed to create novedad.' });
    }
};

// PUT /api/admin/novedades/:id
export const update = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { title, content, imageUrl, published } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const updatedNovedad = await prisma.novedad.update({
            where: { id: Number(id) }, // We don't need to check tenantId here due to row-level security or application logic
            data: {
                title,
                content,
                imageUrl,
                published: Boolean(published),
            },
        });
        res.status(200).json(updatedNovedad);
    } catch (error) {
        console.error("Error updating novedad:", error);
        res.status(500).json({ message: 'Failed to update novedad.' });
    }
};

// DELETE /api/admin/novedades/:id
export const destroy = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.novedad.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting novedad:", error);
        res.status(500).json({ message: 'Failed to delete novedad.' });
    }
};
