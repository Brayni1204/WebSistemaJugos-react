// src/features/controllers/admin/tenantController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Get the current tenant's settings
export const getTenantSettings = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    try {
        // We can re-use the tenant object already attached by the middleware
        res.status(200).json(req.tenant);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching tenant settings.' });
    }
};

// Update the current tenant's settings
export const updateTenantSettings = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, subdomain, ...updateData } = req.body;

    // We explicitly exclude 'subdomain' and 'id' from the update payload
    // to prevent them from being changed.

    try {
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: updateData,
        });
        res.status(200).json(updatedTenant);
    } catch (error) {
        console.error('Error updating tenant settings:', error);
        res.status(500).json({ error: 'An error occurred while updating tenant settings.' });
    }
};

import { uploadStream } from '@/utils/cloudinary';

export const updateTenantImages = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    if (!req.files) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const dataToUpdate: { logo_url?: string; favicon_url?: string } = {};

    try {
        const uploadPromises = [];

        if (files.logo) {
            const logoFile = files.logo[0];
            uploadPromises.push(
                uploadStream(logoFile.buffer, `tenants/${tenantId}/logos`).then(result => {
                    dataToUpdate.logo_url = result.secure_url;
                })
            );
        }

        if (files.favicon) {
            const faviconFile = files.favicon[0];
            uploadPromises.push(
                uploadStream(faviconFile.buffer, `tenants/${tenantId}/favicons`).then(result => {
                    dataToUpdate.favicon_url = result.secure_url;
                })
            );
        }

        await Promise.all(uploadPromises);

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ error: 'No valid image fields (logo, favicon) provided.' });
        }

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: dataToUpdate,
        });

        res.status(200).json(updatedTenant);

    } catch (error) {
        console.error('Error uploading tenant images:', error);
        res.status(500).json({ error: 'An error occurred during image upload.' });
    }
};
