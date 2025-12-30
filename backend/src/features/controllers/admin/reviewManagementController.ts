// src/features/controllers/admin/reviewManagementController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ReviewStatus } from '@/generated/prisma/client';

// GET /api/admin/reviews
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { status } = req.query; // Filter by status (e.g., ?status=PENDING)

    try {
        const whereClause: any = { tenantId };
        if (status && Object.values(ReviewStatus).includes(status as ReviewStatus)) {
            whereClause.status = status as ReviewStatus;
        }

        const reviews = await prisma.resena.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true } },
                producto: { select: { nombre_producto: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews for admin:', error);
        res.status(500).json({ error: 'An error occurred while fetching reviews.' });
    }
};

// PUT /api/admin/reviews/:id/status
export const updateStatus = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(ReviewStatus).includes(status as ReviewStatus)) {
        return res.status(400).json({ error: 'A valid status (APPROVED, REJECTED) is required.' });
    }

    try {
        // First, verify the review belongs to the current tenant
        const reviewToUpdate = await prisma.resena.findFirst({
            where: {
                id: Number(id),
                tenantId: tenantId,
            }
        });

        if (!reviewToUpdate) {
            return res.status(404).json({ error: 'Review not found in this tenant.' });
        }

        const updatedReview = await prisma.resena.update({
            where: { id: Number(id) },
            data: { status: status as ReviewStatus },
        });

        res.status(200).json(updatedReview);
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ error: 'An error occurred while updating review status.' });
    }
};
