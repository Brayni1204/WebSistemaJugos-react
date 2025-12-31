// src/features/controllers/admin/commentManagementController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Workaround for prisma generate issue
enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// GET /api/admin/comments
export const listComments = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const comments = await prisma.pageComment.findMany({
            where: { tenantId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
};

// PATCH /api/admin/comments/:commentId/status
export const updateCommentStatus = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { status } = req.body;
    const tenantId = req.tenant?.id;

    if (!Object.values(CommentStatus).includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const comment = await prisma.pageComment.findFirst({
            where: { id: Number(commentId), tenantId },
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const updatedComment = await prisma.pageComment.update({
            where: { id: Number(commentId) },
            data: { status },
        });

        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update comment status.' });
    }
};

// DELETE /api/admin/comments/:commentId
export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const tenantId = req.tenant?.id;

    try {
        const comment = await prisma.pageComment.findFirst({
            where: { id: Number(commentId), tenantId },
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        await prisma.pageComment.delete({
            where: { id: Number(commentId) },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment.' });
    }
};
