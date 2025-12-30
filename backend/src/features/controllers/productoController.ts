import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { uploadImage } from '../../config/cloudinary';
import fs from 'fs/promises';

export const index = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm = req.query.search as string;
  const categoryId = req.query.id_categoria as string;

  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      tenantId,
      status: 1, // Only active products for admin view
    };

    if (searchTerm) {
      whereClause.nombre_producto = {
        contains: searchTerm,
      };
    }
    if (categoryId) {
        whereClause.id_categoria = parseInt(categoryId);
    }

    const [productos, total] = await prisma.$transaction([
        prisma.producto.findMany({
            where: whereClause,
            include: {
                categoria: true,
                componentes: true,
            },
            skip: skip,
            take: limit,
            orderBy: {
                id: 'desc',
            },
        }),
        prisma.producto.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
        data: productos,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

export const publicIndex = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified.' });
    }
  
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // Show more on public pages
    const searchTerm = req.query.search as string;
    const categoryId = req.query.id_categoria as string;
  
    const skip = (page - 1) * limit;
  
    try {
      const whereClause: any = {
        tenantId,
        status: 1, // Only show active products publicly
      };
  
      if (searchTerm) {
        whereClause.nombre_producto = {
          contains: searchTerm,
        };
      }
      if (categoryId) {
          whereClause.id_categoria = parseInt(categoryId);
      }
  
      const [productos, total] = await prisma.$transaction([
          prisma.producto.findMany({
              where: whereClause,
              include: {
                  categoria: true,
              },
              skip: skip,
              take: limit,
              orderBy: {
                  id: 'desc',
              },
          }),
          prisma.producto.count({ where: whereClause }),
      ]);
  
      const totalPages = Math.ceil(total / limit);
  
      res.json({
          data: productos,
          pagination: {
              total,
              page,
              limit,
              totalPages,
          },
      });
  
    } catch (error) {
      console.error('Error fetching public products:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  };


export const store = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified.' });
    }

    let { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra, componenteIds, tracks_stock } = req.body;

    if (!id_categoria || !nombre_producto || !precio_venta || !precio_compra) {
        return res.status(400).json({ error: 'Category, name, sale price, and purchase price are required.' });
    }
    
    // Parse tracks_stock as a boolean
    const shouldTrackStock = tracks_stock === 'true';

    // Parse componenteIds from string to array of numbers
    let parsedComponenteIds: number[] = [];
    if (componenteIds && typeof componenteIds === 'string') {
        try {
            parsedComponenteIds = JSON.parse(componenteIds).map(Number);
        } catch (e) {
            return res.status(400).json({ error: 'componenteIds must be a valid JSON array string.' });
        }
    } else if (Array.isArray(componenteIds)) {
        parsedComponenteIds = componenteIds.map(Number);
    }
    
    let imageUrl: string | null = null;

    try {
      if (req.file) {
        imageUrl = await uploadImage(req.file.path);
      }

      const producto = await prisma.producto.create({
        data: {
          tenantId,
          id_categoria: parseInt(id_categoria),
          nombre_producto,
          descripcion,
          stock: shouldTrackStock ? (stock ? parseInt(stock) : 0) : 0,
          tracks_stock: shouldTrackStock,
          status: status ? parseInt(status) : 1,
          precio_venta: parseFloat(precio_venta),
          precio_compra: parseFloat(precio_compra),
          imageUrl,
          componentes: {
            connect: parsedComponenteIds.map(id => ({ id }))
          }
        },
      });
      res.status(201).json(producto);
    } catch (error: any) {
      console.error('Error creating product:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El nombre del producto ya existe.' });
      }
      res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
    } finally {
        if (req.file) {
            await fs.unlink(req.file.path);
        }
    }
  };

export const show = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }
  
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  try {
    const producto = await prisma.producto.findFirst({
      where: { 
          AND: [{ id: parseInt(id) }, { tenantId }] 
      },
      include: {
        categoria: true,
        componentes: true,
      },
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};

export const update = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
    }
    
    let { id_categoria, nombre_producto, descripcion, stock, status, precio_venta, precio_compra, componenteIds, tracks_stock } = req.body;
    
    const shouldTrackStock = tracks_stock === 'true';

    // Parse componenteIds from string to array of numbers
    let parsedComponenteIds: number[] | undefined = undefined;
    if (componenteIds && typeof componenteIds === 'string') {
        try {
            parsedComponenteIds = JSON.parse(componenteIds).map(Number);
        } catch (e) {
            return res.status(400).json({ error: 'componenteIds must be a valid JSON array string.' });
        }
    } else if (Array.isArray(componenteIds)) {
        parsedComponenteIds = componenteIds.map(Number);
    }

    try {
      const existingProducto = await prisma.producto.findFirst({
        where: { AND: [{ id: parseInt(id) }, { tenantId }] },
      });

      if (!existingProducto) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      let imageUrl: string | undefined = undefined;

      if (req.file) {
        imageUrl = await uploadImage(req.file.path);
        // Optionally delete old image from Cloudinary here if it exists
      }

      const producto = await prisma.producto.update({
        where: { id: parseInt(id) },
        data: {
          id_categoria: id_categoria ? parseInt(id_categoria) : undefined,
          nombre_producto,
          descripcion,
          stock: shouldTrackStock ? (stock ? parseInt(stock) : 0) : 0,
          tracks_stock: shouldTrackStock,
          status: status ? parseInt(status) : undefined,
          precio_venta: precio_venta ? parseFloat(precio_venta) : undefined,
          precio_compra: precio_compra ? parseFloat(precio_compra) : undefined,
          imageUrl,
          componentes: parsedComponenteIds ? { set: parsedComponenteIds.map(id => ({ id })) } : undefined,
        },
      });
      res.json(producto);
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El nombre del producto ya existe.' });
      }
      res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
    } finally {
        if (req.file) {
            await fs.unlink(req.file.path);
        }
    }
  };

export const destroy = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }
  
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  try {
    const existingProducto = await prisma.producto.findFirst({
      where: { AND: [{ id: parseInt(id) }, { tenantId }] },
    });

    if (!existingProducto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    // Optionally delete image from Cloudinary here

    await prisma.producto.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
  }
};

export const publicShow = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }
  
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  try {
    const producto = await prisma.producto.findFirst({
      where: { 
          AND: [{ id: parseInt(id) }, { tenantId }, { status: 1 }] // Only show active products
      },
      include: {
        categoria: true,
        componentes: true,
      },
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error fetching public product:', error);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};
