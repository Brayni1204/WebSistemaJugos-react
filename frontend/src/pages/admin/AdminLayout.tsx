// src/pages/admin/AdminLayout.tsx
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LogOut, Menu, X, Home, ShoppingCart, Tag, Box, Coffee, Settings, Users, Truck, ShoppingBasket, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user, hasPermission } = useAdminAuth();
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-gray-100 text-gray-900 font-semibold'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-800">
          <Coffee className="h-6 w-6 text-gray-600" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800">Bienvenido,</p>
            <p className="text-xs text-gray-600">{user?.name}</p>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/admin/dashboard" className={getNavLinkClass}>
            <Home className="h-4 w-4" />
            Dashboard
          </NavLink>
          {hasPermission('view-orders') && (
            <NavLink to="/admin/pedidos" className={getNavLinkClass}>
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </NavLink>
          )}
          {hasPermission('view-gastos') && (
             <NavLink to="/admin/gastos" className={getNavLinkClass}>
              <ShoppingBasket className="h-4 w-4" />
              Compras y Gastos
            </NavLink>
          )}
          <hr className="my-2" />
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Inventario</p>
          {hasPermission('view-products') && (
            <NavLink to="/admin/productos" className={getNavLinkClass}>
              <Box className="h-4 w-4" />
              Productos
            </NavLink>
          )}
          {hasPermission('view-categories') && (
            <NavLink to="/admin/categorias" className={getNavLinkClass}>
              <Tag className="h-4 w-4" />
              Categorías
            </NavLink>
          )}
          {hasPermission('view-proveedores') && (
            <NavLink to="/admin/proveedores" className={getNavLinkClass}>
                <Truck className="h-4 w-4" />
                Proveedores
            </NavLink>
          )}
           <hr className="my-2" />
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Configuración</p>
          {hasPermission('view-mesas') && (
            <NavLink to="/admin/mesas" className={getNavLinkClass}>
              <Coffee className="h-4 w-4" />
              Mesas
            </NavLink>
          )}
          {hasPermission('manage-settings') && (
            <NavLink to="/admin/settings" className={getNavLinkClass}>
              <Settings className="h-4 w-4" />
              Tienda
            </NavLink>
          )}
          {hasPermission('view-users') && (
            <NavLink to="/admin/users" className={getNavLinkClass}>
              <Users className="h-4 w-4" />
              Usuarios
            </NavLink>
          )}
          {hasPermission('view-roles') && (
            <NavLink to="/admin/roles" className={getNavLinkClass}>
              <Users className="h-4 w-4" />
              Roles y Permisos
            </NavLink>
          )}
          {hasPermission('manage-products') && (
            <NavLink to="/admin/reviews" className={getNavLinkClass}>
              <MessageSquare className="h-4 w-4" />
              Reseñas
            </NavLink>
          )}
        </nav>
      </div>
       <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout} 
          className="flex items-center justify-center gap-2 w-full px-4 py-2 font-medium text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-800">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {sidebarContent}
      </aside>

      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm md:justify-end">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 md:hidden"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
             <div className="flex-1 text-center font-semibold text-lg text-gray-800 md:hidden">
              Admin Panel
            </div>

            <div className="w-8 md:hidden"></div>
        </header>
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
