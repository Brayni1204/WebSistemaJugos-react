// src/features/controllers/commentController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// GET /api/comments/:pageType/:pageId
export const getCommentsForPage = async (req: Request, res: Response) => {
    const { pageType, pageId } = req.params;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is missing.' });
    }

    try {
        const allComments = await prisma.pageComment.findMany({
            where: {
                tenantId,
                pageType,
                pageId: Number(pageId),
                status: 'APPROVED',
            },
            include: {
                user: {
                    select: { name: true, profile_photo_path: true }
                }
            },
            orderBy: { createdAt: 'asc' },
        });

        const commentsById = new Map(allComments.map(comment => [comment.id, { ...comment, children: [] }]));
        const rootComments: any[] = [];

        for (const comment of commentsById.values()) {
            if (comment.parentId && commentsById.has(comment.parentId)) {
                const parent = commentsById.get(comment.parentId);
                if(parent) {
                    parent.children.push(comment as never);
                }
            } else {
                rootComments.push(comment);
            }
        }

        res.status(200).json(rootComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
};

// POST /api/comments/:pageType/:pageId
export const createComment = async (req: Request, res: Response) => {
    const { pageType, pageId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user?.id;
    const tenantId = req.tenant?.id;

    if (!userId || !tenantId) {
        return res.status(400).json({ message: 'User or Tenant ID is missing.' });
    }
    if (!content) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        const newComment = await prisma.pageComment.create({
            data: {
                content,
                pageType,
                pageId: Number(pageId),
                parentId: parentId ? Number(parentId) : null,
                userId,
                tenantId,
            },
            include: {
                user: {
                    select: { name: true, profile_photo_path: true }
                }
            }
        });
        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: 'Failed to create comment.' });
    }
};
