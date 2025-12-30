// src/features/controllers/admin/permissionController.ts
import { Request, Response } from 'express';
import { PERMISSIONS } from '@/config/permissions';
import prisma from '@/config/prisma';

// This function seeds the permissions table and returns all permissions.
export const index = async (req: Request, res: Response) => {
    try {
        // Use a transaction to find or create permissions
        // This makes the seeding process idempotent
        await prisma.$transaction(async (tx) => {
            for (const perm of PERMISSIONS) {
                await tx.permission.upsert({
                    where: { name: perm },
                    update: {},
                    create: { name: perm },
                });
            }
        });

        // Return all permissions from the database
        const allPermissions = await prisma.permission.findMany({
            orderBy: { name: 'asc' }
        });

        res.status(200).json(allPermissions);
    } catch (error) {
        console.error("Error seeding or fetching permissions:", error);
        res.status(500).json({ error: 'Failed to retrieve permissions.' });
    }
};
