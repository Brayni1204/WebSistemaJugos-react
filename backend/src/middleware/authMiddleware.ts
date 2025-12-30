import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/config/prisma';

// Extend the Express Request type to include the user object
interface AuthenticatedRequest extends Request {
  user?: any; 
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        roles: {
          include: {
            permissions: true,
          },
        },
       },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user; // Attach user with roles and permissions to the request
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(401).json({ message: 'Invalid or expired token.', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export default authMiddleware;