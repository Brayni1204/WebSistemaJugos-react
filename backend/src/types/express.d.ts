// src/types/express.d.ts
import { Request } from 'express';
import { User, Tenant, Role } from '@prisma/client';

// Extend the Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: User & { roles?: Role[] }; // User object, optionally with roles
      tenant?: Tenant; // Tenant object attached by tenantMiddleware
    }
  }
}