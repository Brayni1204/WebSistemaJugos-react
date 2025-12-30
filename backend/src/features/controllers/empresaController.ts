import { Request, Response } from 'express';
import prisma from '@/config/prisma';

export const index = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }

  try {
    const empresa = await prisma.empresa.findMany({
      where: { tenantId: tenantId },
    });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la información de la empresa' });
  }
};
