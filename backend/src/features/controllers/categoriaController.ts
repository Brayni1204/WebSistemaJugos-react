// src/features/controllers/categoriaController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@/generated/prisma/client';
import { uploadImage } from '../../config/cloudinary';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Corresponds to GET /
export const index = async (req: Request, res: Response) => {
  const tenantId = (req as any).tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is missing from request.' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm = req.query.search as string;

  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      tenantId: Number(tenantId),
    };

    if (searchTerm) {
      whereClause.nombre_categoria = {
        contains: searchTerm,
      };
    }

    const total = await prisma.categoria.count({ where: whereClause });

    const categories = await prisma.categoria.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: {
        id: 'desc',
      },
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'An error occurred while fetching categories.' });
  }
};

// Corresponds to GET /:id
export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
  }
  const tenantId = (req as any).tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is missing from request.' });
  }

  try {
    const category = await prisma.categoria.findFirst({
      where: {
        AND: [
          { id: Number(id) },
          { tenantId: Number(tenantId) }
        ]
      },
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the category.' });
  }
};

// Corresponds to POST /
export const store = async (req: Request, res: Response) => {
  const { nombre_categoria, descripcion } = req.body;
  const tenantId = (req as any).tenant?.id;
  
  if (!tenantId || !nombre_categoria) {
    return res.status(400).json({ error: 'Tenant ID and category name are required.' });
  }

  let imageUrl: string | null = null;

  try {
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    const newCategory = await prisma.categoria.create({
      data: {
        nombre_categoria,
        descripcion,
        imageUrl,
        tenantId: Number(tenantId),
        status: 1, // Default status
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    // Check for unique constraint violation
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ error: 'A category with this name already exists for this tenant.' });
    }
    res.status(500).json({ error: 'An error occurred while creating the category.' });
  } finally {
    if (req.file) {
      await fs.unlink(req.file.path); // Clean up the temporary file
    }
  }
};

// Corresponds to PUT /:id
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
  }
  const { nombre_categoria, descripcion, status } = req.body;
  const tenantId = (req as any).tenant?.id;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is missing from request.' });
  }

  try {
    const category = await prisma.categoria.findFirst({
      where: {
        AND: [
          { id: Number(id) },
          { tenantId: Number(tenantId) }
        ]
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let imageUrl: string | undefined = undefined;
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    const updatedCategory = await prisma.categoria.update({
      where: { id: Number(id) },
      data: {
        nombre_categoria,
        descripcion,
        status: status ? Number(status) : undefined,
        imageUrl, // This will be the new Cloudinary URL or undefined
      },
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: 'A category with this name already exists for this tenant.' });
    }
    res.status(500).json({ error: 'An error occurred while updating the category.' });
  } finally {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
  }
};

// Corresponds to DELETE /:id
export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID de la categoría debe ser un número.' });
  }
  const tenantId = (req as any).tenant?.id;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is missing from request.' });
  }
  
  try {
    // First, verify the category belongs to the tenant before deleting
    const category = await prisma.categoria.findFirst({
        where: {
          AND: [
            { id: Number(id) },
            { tenantId: Number(tenantId) }
          ]
        }
      });
  
    if (!category) {
    return res.status(404).json({ error: 'Category not found or you do not have permission to delete it.' });
    }

    // TODO: Delete image from Cloudinary before deleting the record

    await prisma.categoria.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the category.' });
  }
};