import { Request, Response, NextFunction } from 'express';
import prisma from '@/config/prisma';

const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let hostname = req.hostname;
    const appDomain = process.env.APP_DOMAIN; // Should be: "jugueria.techinnovats.com"

    // Handle proxy headers (Portainer/Nginx) and local development
    if (hostname === 'localhost' && req.headers.origin) {
        try {
            const originUrl = new URL(req.headers.origin);
            hostname = originUrl.hostname;
        } catch (e) {
            console.warn('Invalid Origin header:', req.headers.origin);
        }
    }

    let subdomain = '';

    // CORRECTED LOGIC
    // Case 1: We are exactly on the main domain (e.g., jugueria.techinnovats.com)
    if (hostname === appDomain) {
        subdomain = process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
    } 
    // Case 2: We are on a subdomain (e.g., chavez-tienda.jugueria.techinnovats.com)
    else if (appDomain && hostname.endsWith(`.${appDomain}`)) {
        // Extract what is BEFORE the main domain
        const parts = hostname.split(`.${appDomain}`);
        if (parts[0]) {
            subdomain = parts[0];
        }
    }
    // Case 3: Local Development
    else if (hostname.endsWith('.localhost')) {
        subdomain = hostname.replace('.localhost', '');
    }

    // Security fallback
    if (!subdomain) {
         subdomain = process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
    }

    console.log(`Detected Hostname: ${hostname} | Extracted Subdomain: ${subdomain}`);

    // Database Lookup
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: subdomain },
    });

    if (!tenant) {
      console.error(`!!! TENANT NOT FOUND: '${subdomain}'. Hostname was: ${hostname}`);
      return res.status(404).json({ 
          message: `Tenant '${subdomain}' not found.`,
          debug: { hostname, extractedSubdomain: subdomain }
      });
    }

    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Site is inactive.' });
    }

    // Inject tenant into the request
    (req as any).tenant = tenant;
    next();

  } catch (error) {
    console.error('Error in tenant middleware:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default tenantMiddleware;
