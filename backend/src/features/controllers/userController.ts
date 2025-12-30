import { Request, Response } from 'express';
import prisma from '@/config/prisma';

export const getAllUsers = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }

  try {
    const users = await prisma.user.findMany({
      where: { tenantId: tenantId },
      select: { id: true, name: true, email: true, is_active: true } // Avoid sending password hashes
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant not identified.' });
  }

  const { id } = req.params;
  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: Number(id),
        tenantId: tenantId 
      },
      select: { id: true, name: true, email: true, is_active: true } // Avoid sending password hashes
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
