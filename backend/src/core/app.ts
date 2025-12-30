/// <reference path="../types/express.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from '@/api/userRoutes';
import authRoutes from '@/api/authRoutes';
import adminAuthRoutes from '@/api/admin/authRoutes';
import categoriaRoutes from '@/api/categoriaRoutes';
import productoRoutes from '@/api/productoRoutes';
import componenteRoutes from '@/api/componenteRoutes';
import resenaRoutes from '@/api/resenaRoutes';
import cartRoutes from '@/api/cartRoutes';
import profileRoutes from '@/api/profileRoutes';
import mesaRoutes from '@/api/mesaRoutes';
import orderRoutes from '@/api/admin/orderRoutes';
import orderStatusRoutes from '@/api/admin/orderStatusRoutes';
import tenantRoutes from '@/api/tenantRoutes';
import paginaRoutes from '@/api/paginaRoutes';
import publicCategoriaRoutes from '@/api/public/categoriaRoutes';
import publicEmpresaRoutes from '@/api/public/empresaRoutes';
import publicPaginaRoutes from '@/api/public/paginaRoutes';
import roleRoutes from '@/api/admin/roleRoutes';
import permissionRoutes from '@/api/admin/permissionRoutes';
import tenantSettingsRoutes from '@/api/admin/tenantSettingsRoutes';
import proveedorRoutes from '@/api/admin/proveedorRoutes';
import gastoRoutes from '@/api/admin/gastoRoutes';
import userManagementRoutes from '@/api/admin/userManagementRoutes';
import reviewManagementRoutes from '@/api/admin/reviewManagementRoutes';
import dashboardRoutes from '@/api/admin/dashboardRoutes';
import publicMesaRoutes from '@/api/public/mesaRoutes';
import publicOrderRoutes from '@/api/public/orderRoutes';
import publicProductoRoutes from '@/api/public/productoRoutes';
import waiterRoutes from '@/api/waiterRoutes';
import tenantMiddleware from '@/middleware/tenantMiddleware';
import readOnlyDemoMiddleware from '@/middleware/readOnlyDemoMiddleware';
import { validateApiKey } from '@/middleware/apiKeyMiddleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Provisioning routes are now protected by an API key
app.use('/api/provisioning', validateApiKey, tenantRoutes);

// This middleware must run before all your tenant-specific routes
app.use(tenantMiddleware);
// This middleware checks if the tenant is 'demo' and restricts write operations
app.use(readOnlyDemoMiddleware);

app.get('/api/tenant-info', (req, res) => {
  if (req.tenant) {
    const {
      id, name, theme_color, theme_secondary_color, dark_mode_enabled,
      logo_url, favicon_url, hero_banner_url, description, address, contact_phone, business_email, social_links,
      mision, vision, delivery_cost
    } = req.tenant;
    res.json({
      id, name, theme_color, theme_secondary_color, dark_mode_enabled,
      logo_url, favicon_url, hero_banner_url, description, address, contact_phone, business_email, social_links,
      mision, vision, delivery_cost
    });
  } else {
    res.status(404).json({ message: 'Tenant information not found.' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// WAITER SPECIFIC ROUTES
app.use('/api/waiter', waiterRoutes);

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', categoriaRoutes);
app.use('/api/admin', productoRoutes);
app.use('/api/admin', componenteRoutes);
app.use('/api/admin', tenantSettingsRoutes);
app.use('/api/admin', permissionRoutes);
app.use('/api/admin', roleRoutes);
app.use('/api/admin', proveedorRoutes);
app.use('/api/admin', gastoRoutes);
app.use('/api/admin', userManagementRoutes);
app.use('/api/admin', reviewManagementRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/productos', resenaRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', mesaRoutes);
app.use('/api/admin', orderRoutes);
app.use('/api/admin', orderStatusRoutes);
app.use('/api', paginaRoutes);
app.use('/api/public', publicCategoriaRoutes);
app.use('/api/public', publicEmpresaRoutes);
app.use('/api/public', publicPaginaRoutes);
app.use('/api/public', publicProductoRoutes);
app.use('/api/public', publicOrderRoutes);
app.use('/api/public', publicMesaRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('GLOBAL ERROR HANDLER:', err.stack || err.message);
  res.status(500).send('Something broke!');
});

export default app;