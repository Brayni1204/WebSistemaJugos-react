import { Request, Response, NextFunction } from 'express';

const readOnlyDemoMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenant = req.tenant;
  const method = req.method;

  const isDemoTenant = tenant?.subdomain === (process.env.DEMO_TENANT_SUBDOMAIN || 'demo');
  const isReadOnlyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isDemoTenant && isReadOnlyMethod) {
    return res.status(403).json({ 
      message: 'This is a demo site. Write operations (create, update, delete) are not allowed.' 
    });
  }

  next();
};

export default readOnlyDemoMiddleware;
