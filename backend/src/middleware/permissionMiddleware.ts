// src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Permission } from '@/config/permissions';

export const checkPermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // The 'Admin' role has all permissions implicitly
    const isAdmin = user.roles.some((role: any) => role.name === 'Admin');
    if (isAdmin) {
      return next();
    }

    // Get all unique permissions from all roles the user has
    const userPermissions = new Set<string>();
    user.roles.forEach((role: any) => {
      role.permissions.forEach((perm: any) => {
        userPermissions.add(perm.name);
      });
    });

    if (userPermissions.has(permission)) {
      next(); // User has the required permission
    } else {
      res.status(403).json({ message: `Forbidden: You do not have the '${permission}' permission.` });
    }
  };
};
