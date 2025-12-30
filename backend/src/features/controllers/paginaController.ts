import { Request, Response } from 'express';
import prisma from '@/config/prisma';

export const getPublicPages = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }

  try {
    const paginas = await prisma.pagina.findMany({
      where: {
        tenantId: tenantId,
        status: 1, // Assuming 1 is 'published'
      },
      include: {
        subtitulos: {
          select: {
            id: true,
            titulo_subtitulo: true,
            resumen: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.json(paginas);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Error fetching pages.' });
  }
};
