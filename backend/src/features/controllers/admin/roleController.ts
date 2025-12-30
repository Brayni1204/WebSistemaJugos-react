// src/features/controllers/admin/roleController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// GET /api/admin/roles
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const roles = await prisma.role.findMany({
            where: { tenantId },
            include: { _count: { select: { users: true, permissions: true } } },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles.' });
    }
};

// GET /api/admin/roles/:id
export const show = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    try {
        const role = await prisma.role.findFirst({
            where: { id: Number(id), tenantId },
            include: { permissions: true },
        });
        if (!role) {
            return res.status(404).json({ error: 'Role not found.' });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch role.' });
    }
};

// POST /api/admin/roles
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Role name is required.' });
    }
    try {
        const newRole = await prisma.role.create({
            data: {
                name,
                tenantId: tenantId!,
            },
        });
        res.status(201).json(newRole);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A role with this name already exists.' });
        }
        res.status(500).json({ error: 'Failed to create role.' });
    }
};

// PUT /api/admin/roles/:id
export const update = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { name, permissionIds } = req.body; // Expect an array of permission IDs

    if (!name || !Array.isArray(permissionIds)) {
        return res.status(400).json({ error: 'Role name and an array of permissionIds are required.' });
    }

    try {
        const updatedRole = await prisma.role.update({
            where: { id: Number(id) },
            data: {
                name,
                permissions: {
                    set: permissionIds.map((id: number) => ({ id })),
                },
            },
            include: { permissions: true },
        });
        res.status(200).json(updatedRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update role.' });
    }
};

// DELETE /api/admin/roles/:id
export const destroy = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;

    // Prevent deletion of core 'Admin' role
    const role = await prisma.role.findFirst({ where: { id: Number(id), tenantId } });
    if (role?.name === 'Admin') {
        return res.status(403).json({ error: "The 'Admin' role cannot be deleted." });
    }

    try {
        await prisma.role.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete role.' });
    }
};
