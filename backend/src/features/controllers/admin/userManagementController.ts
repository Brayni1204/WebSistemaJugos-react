// src/features/controllers/admin/userManagementController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import bcrypt from 'bcrypt';

// GET /api/admin/users
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    try {
        const users = await prisma.user.findMany({
            where: { tenantId },
            include: {
                roles: true,
            },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
};

// PUT /api/admin/users/:id/roles
export const updateUserRoles = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds)) {
        return res.status(400).json({ message: 'roleIds must be an array of numbers.' });
    }

    try {
        // Ensure the user being updated belongs to the same tenant
        const userToUpdate = await prisma.user.findFirst({
            where: { id: Number(id), tenantId }
        });

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found in this tenant.' });
        }
        
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                roles: {
                    set: roleIds.map((id: number) => ({ id })),
                },
            },
            include: { roles: true },
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user roles:", error);
        res.status(500).json({ message: 'Failed to update user roles.' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { name, email, password, pin, roleIds } = req.body;

    if (!name || !email || !password || !roleIds) {
        return res.status(400).json({ message: 'Name, email, password, and roleIds are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = pin ? await bcrypt.hash(pin, 10) : null;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                pin: hashedPin,
                tenantId,
                email_verified_at: new Date(), // Admins create verified users
                roles: {
                    connect: roleIds.map((id: number) => ({ id })),
                },
            },
            include: { roles: true },
        });

        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(409).json({ message: 'A user with this email already exists in this tenant.' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    const { id } = req.params;
    const { name, email, password, pin, roleIds } = req.body;

    if (!name && !email && !password && !pin && !roleIds) {
        return res.status(400).json({ message: 'At least one field to update must be provided.' });
    }

    try {
        // Ensure the user being updated belongs to the same tenant
        const userToUpdate = await prisma.user.findFirst({
            where: { id: Number(id), tenantId }
        });

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found in this tenant.' });
        }

        const dataToUpdate: any = {
            name,
            email,
        };

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        if (pin) {
            dataToUpdate.pin = await bcrypt.hash(pin, 10);
        }

        if (roleIds && Array.isArray(roleIds)) {
            dataToUpdate.roles = {
                set: roleIds.map((id: number) => ({ id })),
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: { roles: true },
        });

        res.status(200).json(updatedUser);
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(409).json({ message: 'A user with this email already exists in this tenant.' });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};
