// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PERMISSIONS } from '../src/config/permissions';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Permissions
  console.log('Upserting permissions...');
  const seededPermissions = [];
  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
    seededPermissions.push(permission);
  }
  console.log('Permissions seeded.');
  const allPermissionIds = seededPermissions.map(p => ({ id: p.id }));

  // 2. Create or Update the Demo Tenant
  const demoSubdomain = process.env.DEMO_TENANT_SUBDOMAIN || 'demo';
  const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@demo.com';
  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD || 'password';

  console.log(`Upserting demo tenant with subdomain: ${demoSubdomain}`);
  
  await prisma.$transaction(async (tx) => {
    // Upsert tenant
    const tenant = await tx.tenant.upsert({
        where: { subdomain: demoSubdomain },
        update: {},
        create: {
            name: 'Demo Tenant',
            subdomain: demoSubdomain,
            description: 'This is a demonstration tenant.',
            theme_color: '#4f46e5',
            theme_secondary_color: '#be185d',
        }
    });

    // Upsert Admin role for this tenant and connect all permissions
    const adminRole = await tx.role.upsert({
        where: { name_tenantId: { name: 'Admin', tenantId: tenant.id } },
        update: {
             permissions: { set: allPermissionIds }
        },
        create: {
            name: 'Admin',
            tenantId: tenant.id,
            permissions: { connect: allPermissionIds },
        }
    });
    
    // Upsert the Admin user for this tenant
    const hashedPassword = await bcrypt.hash(demoAdminPassword, 10);
    await tx.user.upsert({
        where: { email_tenantId: { email: demoAdminEmail, tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Demo Admin',
            email: demoAdminEmail,
            password: hashedPassword,
            tenantId: tenant.id,
            email_verified_at: new Date(),
            roles: {
                connect: { id: adminRole.id }
            }
        }
    });

     console.log(`Demo tenant '${demoSubdomain}' and its admin user are configured.`);
  });

  // 4. Create or Update the 'tienda-chavez' Tenant
  const chavezSubdomain = 'tienda-chavez';
  const chavezAdminEmail = 'admin@chavez.com';
  const chavezAdminPassword = 'password';

  console.log(`Upserting chavez tenant with subdomain: ${chavezSubdomain}`);
  
  await prisma.$transaction(async (tx) => {
    // Upsert tenant
    const tenant = await tx.tenant.upsert({
        where: { subdomain: chavezSubdomain },
        update: {},
        create: {
            name: 'Tienda Chavez',
            subdomain: chavezSubdomain,
            description: 'Tenant para la tienda Chavez',
            theme_color: '#0d9488',
            theme_secondary_color: '#f59e0b',
        }
    });

    // Upsert Admin role for this tenant and connect all permissions
    const adminRole = await tx.role.upsert({
        where: { name_tenantId: { name: 'Admin', tenantId: tenant.id } },
        update: {
             permissions: { set: allPermissionIds }
        },
        create: {
            name: 'Admin',
            tenantId: tenant.id,
            permissions: { connect: allPermissionIds },
        }
    });

    // Upsert Mozo role for this tenant (no permissions by default)
    const mozoRole = await tx.role.upsert({
        where: { name_tenantId: { name: 'Mozo', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Mozo',
            tenantId: tenant.id,
        }
    });
    
    // Upsert the Admin user for this tenant
    const hashedPassword = await bcrypt.hash(chavezAdminPassword, 10);
    await tx.user.upsert({
        where: { email_tenantId: { email: chavezAdminEmail, tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Admin Chavez',
            email: chavezAdminEmail,
            password: hashedPassword,
            tenantId: tenant.id,
            email_verified_at: new Date(),
            roles: {
                connect: { id: adminRole.id }
            }
        }
    });

     console.log(`Chavez tenant '${chavezSubdomain}' and its admin user are configured.`);
  });


  // 5. Optional: Grant all permissions to existing 'Admin' roles if needed (good for maintenance)
  console.log("Checking other tenants...");
  const otherTenants = await prisma.tenant.findMany({
    where: { 
        subdomain: { 
            notIn: [demoSubdomain, chavezSubdomain] 
        } 
    },
    include: { roles: { where: { name: 'Admin' } } },
  });

  if (otherTenants.length > 0) {
      console.log(`Found ${otherTenants.length} other tenants. Updating their 'Admin' roles...`);
      for (const tenant of otherTenants) {
        if (tenant.roles.length > 0) {
          const adminRole = tenant.roles[0];
          await prisma.role.update({
            where: { id: adminRole.id },
            data: { permissions: { set: allPermissionIds } },
          });
          console.log(`'Admin' role for ${tenant.name} updated.`);
        }
      }
  }


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
