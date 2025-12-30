import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/config/prisma';

// Extend the Express Request type to include user and tenant
interface WaiterRequest extends Request {
  user?: any;
  tenant?: any; // Assuming tenant is attached by a previous middleware
}

const waiterAuthMiddleware = async (req: WaiterRequest, res: Response, next: NextFunction) => {
  console.log('--- Waiter Auth Middleware Triggered ---');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('!!! No Authorization header with Bearer token found.');
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];
  console.log(`Token received: ${token}`);

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Token decoded successfully:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: true,
      },
    });

    // 1. Check if user exists
    if (!user) {
      console.error(`!!! User not found for ID: ${decoded.userId}`);
      return res.status(401).json({ message: 'User not found.' });
    }
    console.log(`User found: ${user.name}`);

    // 2. Check if the user has the 'Mozo' role
    const isWaiter = user.roles.some(role => role.name === 'Mozo');
    if (!isWaiter) {
      console.error(`!!! User ${user.name} does not have 'Mozo' role.`);
      return res.status(403).json({ message: 'Access denied. Waiter role required.' });
    }
    console.log(`User role check passed.`);

    // 3. Attach user to the request
    req.user = user;
    
    // Assuming a tenant resolution middleware runs before this one and attaches the tenant
    if (!req.tenant) {
        console.warn('!!! Tenant object not found on request, attempting to find it now.');
        const tenant = await prisma.tenant.findUnique({ where: { id: decoded.tenantId } });
        if (!tenant) {
            console.error(`!!! Tenant not found for ID: ${decoded.tenantId}`);
            return res.status(401).json({ message: 'Tenant not found for this user.' });
        }
        req.tenant = tenant;
    }

    console.log('--- Waiter Auth Middleware Success, calling next() ---');
    next();
  } catch (error) {
    console.error('!!! Error in waiter auth middleware:', error);
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Session expired. Please enter PIN again.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export default waiterAuthMiddleware;
