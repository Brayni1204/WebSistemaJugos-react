import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import * as bcrypt from 'bcrypt';

// We would configure Cloudinary here using credentials from .env
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({ ... });

export const getTenantTheme = async (req: Request, res: Response) => {
  // In a real multi-tenant app, you'd resolve the tenant from the hostname (e.g., req.hostname)
  // For simplicity here, we'll use a query parameter.
  const { subdomain } = req.query;

  if (!subdomain || typeof subdomain !== 'string') {
    return res.status(400).json({ message: 'Subdomain query parameter is required.' });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        theme_color: true,
        theme_secondary_color: true,
        dark_mode_enabled: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    res.status(200).json({
      theme_color: tenant.theme_color || '#0d9488', // Default to a teal color if not set
      theme_secondary_color: tenant.theme_secondary_color || '#166534', // Default to a green color if not set
      dark_mode_enabled: tenant.dark_mode_enabled,
    });
  } catch (error: any) {
    console.error(`Error fetching theme for subdomain ${subdomain}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  const {
    name,
    subdomain,
    adminEmail,
    adminPassword,
    business_email,
    contact_phone,
    keywords,
    description,
    theme_color,
    address,
    about_us,
    // faq, shipping_policy, terms_conditions, social_links, etc.
  } = req.body;

  try {
    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (existingTenant) {
      return res.status(409).json({ message: 'Subdomain already in use.' });
    }
    
    // Using a transaction to ensure all or nothing is created
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get all permissions that should be assigned to the admin role
      const allPermissions = await tx.permission.findMany();
      const allPermissionIds = allPermissions.map(p => ({ id: p.id }));

      // 2. Create the tenant
      const newTenant = await tx.tenant.create({
        data: {
          name,
          subdomain,
          business_email,
          contact_phone,
          description,
          theme_color,
          theme_secondary_color: '#166534', // A default secondary color (e.g., green-800)
          address,
          about_us,
        },
      });

      // 3. Create the "Admin" role for this tenant and connect all permissions
      const adminRole = await tx.role.create({
        data: {
          name: 'Admin',
          tenantId: newTenant.id,
          permissions: {
            connect: allPermissionIds,
          },
        },
      });

      // 4. Hash the admin password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 5. Create the admin user and connect them to the Admin role
      const newAdmin = await tx.user.create({
        data: {
          name: `${name} Admin`,
          email: adminEmail,
          password: hashedPassword,
          tenantId: newTenant.id,
          roles: {
            connect: { id: adminRole.id },
          },
        },
      });

      return { newTenant, newAdmin };
    });

    res.status(201).json({
      message: 'Tenant created successfully!',
      tenant: result.newTenant,
      admin: { id: result.newAdmin.id, email: result.newAdmin.email },
    });

  } catch (error: any) {
    // Check for specific unique constraint errors that might not be caught by the initial check
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'A user with this email may already exist for the tenant, or another unique constraint was violated.' });
    }
    console.error('Error creating tenant:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
