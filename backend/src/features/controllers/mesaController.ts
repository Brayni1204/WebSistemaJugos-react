import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// ... (existing index, store, show, update, destroy functions) ...

// Generate QR Code for a table
export const generateQrCode = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }

    try {
        const [mesa, tenant] = await Promise.all([
            prisma.mesa.findFirst({
                where: { AND: [{ id: Number(id) }, { tenantId }] },
            }),
            prisma.tenant.findUnique({
                where: { id: tenantId },
            }),
        ]);

        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found.' });
        }

        // Construct the URL. In production, you'd use your actual domain structure.
        // The frontend will be running on a different port, so we use localhost:5173 for development.
        const url = `${req.protocol}://${tenant.subdomain}.localhost:5173/mesa/${mesa.uuid}`;

        const qrCodeDataUrl = await QRCode.toDataURL(url);

        // Save the generated QR code to the database for caching/future use
        const updatedMesa = await prisma.mesa.update({
            where: { id: Number(id) },
            data: { codigo_qr: qrCodeDataUrl },
        });

        res.status(200).json({
            message: 'QR Code generated successfully.',
            qrCodeUrl: qrCodeDataUrl,
            table: updatedMesa,
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'An error occurred while generating the QR code.' });
    }
};
// List all tables for the tenant
export const index = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    try {
        const mesas = await prisma.mesa.findMany({
            where: { tenantId },
            orderBy: { numero_mesa: 'asc' },
        });
        res.status(200).json(mesas);
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'An error occurred while fetching tables.' });
    }
};

// Create a new table
export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    try {
        // Find the highest table number for the current tenant
        const lastTable = await prisma.mesa.findFirst({
            where: { tenantId },
            orderBy: { numero_mesa: 'desc' },
        });

        const newTableNumber = lastTable ? lastTable.numero_mesa + 1 : 1;

        const newMesa = await prisma.mesa.create({
            data: {
                numero_mesa: newTableNumber,
                uuid: uuidv4(),
                tenantId,
                estado: 'disponible',
                status: 1,
            },
        });
        res.status(201).json(newMesa);
    } catch (error: any) {
        if (error.code === 'P2002') {
             // This case should be less likely now but is good to keep as a safeguard
            return res.status(409).json({ error: 'A table with this number already exists.' });
        }
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'An error occurred while creating the table.' });
    }
};

// Get a single table's details (e.g., for QR code generation)
export const show = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }

    try {
        const mesa = await prisma.mesa.findFirst({
            where: {
                AND: [{ id: Number(id) }, { tenantId }],
            },
        });

        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }
        res.status(200).json(mesa);
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'An error occurred while fetching the table.' });
    }
};

// Update a table (e.g., change its status)
export const update = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }

    const { estado } = req.body;
    if (!estado || !['disponible', 'ocupada', 'reservada'].includes(estado)) {
        return res.status(400).json({ error: 'A valid status is required (disponible, ocupada, reservada).' });
    }

    try {
        const mesa = await prisma.mesa.findFirst({
            where: { AND: [{ id: Number(id) }, { tenantId }] },
        });

        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }

        const updatedMesa = await prisma.mesa.update({
            where: { id: Number(id) },
            data: { estado },
        });

        res.status(200).json(updatedMesa);
    } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ error: 'An error occurred while updating the table.' });
    }
};


// Delete a table
export const destroy = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'Table ID must be a number.' });
    }

    try {
        const mesa = await prisma.mesa.findFirst({
            where: { AND: [{ id: Number(id) }, { tenantId }] },
        });

        if (!mesa) {
            return res.status(404).json({ error: 'Table not found.' });
        }

        await prisma.mesa.delete({
            where: { id: Number(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'An error occurred while deleting the table.' });
    }
};
