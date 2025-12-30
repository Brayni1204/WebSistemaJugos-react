// src/middleware/customerAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/config/prisma';

// Extend the Express Request type to include the user object
interface AuthenticatedRequest extends Request {
  user?: any; 
}

const customerAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { cliente: true }, // Include cliente profile
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    
    // Unlike the admin middleware, we DO NOT check for a specific role here.
    // We just verify the user exists and is authenticated.

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error('Error in customer auth middleware:', error);
    return res.status(401).json({ message: 'Invalid or expired token.', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export default customerAuthMiddleware;
