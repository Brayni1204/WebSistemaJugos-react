// src/features/controllers/resenaController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Get reviews for a specific product
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { productoId } = req.params;
    if (isNaN(Number(productoId))) {
        return res.status(400).json({ error: 'Product ID must be a number.' });
    }

    try {
        const resenas = await prisma.resena.findMany({
            where: {
                AND: [
                    { productoId: Number(productoId) },
                    { tenantId },
                    { status: 'APPROVED' },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile_photo_path: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating
        const totalRating = resenas.reduce((sum, resena) => sum + resena.rating, 0);
        const averageRating = resenas.length > 0 ? totalRating / resenas.length : 0;

        res.status(200).json({
            resenas,
            averageRating,
            totalResenas: resenas.length,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'An error occurred while fetching reviews.' });
    }
};

// Create a new review for a product
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id; // Assuming user ID is available from auth middleware
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { productoId } = req.params;
    if (isNaN(Number(productoId))) {
        return res.status(400).json({ error: 'Product ID must be a number.' });
    }

    const { rating, comment } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    try {
        // Check if product exists and belongs to tenant
        const producto = await prisma.producto.findFirst({
            where: {
                AND: [{ id: Number(productoId) }, { tenantId }],
            },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Check if user has already reviewed this product
        const existingResena = await prisma.resena.findUnique({
            where: {
                productoId_userId: {
                    productoId: Number(productoId),
                    userId: userId,
                },
            },
        });
        if (existingResena) {
            return res.status(409).json({ error: 'You have already reviewed this product.' });
        }

        const newResena = await prisma.resena.create({
            data: {
                rating,
                comment,
                productoId: Number(productoId),
                userId,
                tenantId,
                status: 'PENDING',
            },
        });
        res.status(201).json(newResena);
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'An error occurred while creating the review.' });
    }
};
