// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import GenericPage from './pages/GenericPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import WaiterPage from './pages/Waiter/WaiterPage';
import './index.css';

// Admin Imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PedidosPage from './pages/admin/PedidosPage';
import CategoriesPage from './pages/admin/categories/CategoriesPage';
import AdminProductsPage from './pages/admin/products/ProductsPage';
import RolesPage from './pages/admin/roles/RolesPage';
import RoleEditPage from './pages/admin/roles/RoleEditPage';
import UserManagementPage from './pages/admin/users/UserManagementPage';
import ReviewManagementPage from './pages/admin/reviews/ReviewManagementPage';
import TenantSettingsPage from './pages/admin/tenant/TenantSettingsPage';
import ProveedoresPage from './pages/admin/proveedores/ProveedoresPage';
import GastosPage from './pages/admin/gastos/GastosPage';
import GastoCreatePage from './pages/admin/gastos/GastoCreatePage';
import MesasPage from './pages/admin/mesas/MesasPage';
import CreateOrderPage from './pages/admin/pedidos/CreateOrderPage';
import ViewOrderPage from './pages/admin/pedidos/ViewOrderPage';
import EditOrderPage from './pages/admin/pedidos/EditOrderPage';
import ReceiptPage from './pages/admin/pedidos/ReceiptPage';
import TableMenuPage from './pages/TableMenuPage';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <Router>
                <Routes>
                  {/* Public and Customer-facing routes */}
                  <Route path="/*" element={
                      <Routes>
                        <Route path="/mesero" element={<WaiterPage />}>
                          <Route path="mesa/:tableId" element={<WaiterPage />} />
                        </Route>
                        <Route path="/mesa/:table_uuid" element={<TableMenuPage />} />
                        <Route path="/" element={<MainLayout />}>
                          <Route index element={<HomePage />} />
                          <Route path="nosotros" element={<AboutPage />} />
                          <Route path="productos" element={<ProductsPage />} />
                          <Route path="productos/:id" element={<ProductDetailPage />} />
                          <Route path="carrito" element={<CartPage />} />
                          <Route path="perfil" element={<ProfilePage />} />
                          <Route path=":slug" element={<GenericPage />} />
                        </Route>
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/recibo/:orderId" element={<ReceiptPage mode="waiter" />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                  } />

                  {/* Admin routes */}
                  <Route path="/admin/*" element={
                      <Routes>
                        <Route path="login" element={<AdminLoginPage />} />
                        <Route element={<AdminProtectedRoute />}>
                          <Route element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="settings" element={<TenantSettingsPage />} />
                            <Route path="roles" element={<RolesPage />} />
                            <Route path="roles/:id" element={<RoleEditPage />} />
                            <Route path="users" element={<UserManagementPage />} />
                            <Route path="reviews" element={<ReviewManagementPage />} />
                            <Route path="proveedores" element={<ProveedoresPage />} />
                            <Route path="gastos" element={<GastosPage />} />
                            <Route path="gastos/nueva" element={<GastoCreatePage />} />
                            <Route path="pedidos" element={<PedidosPage />} />
                            <Route path="pedidos/crear" element={<CreateOrderPage />} />
                            <Route path="pedidos/:id" element={<ViewOrderPage />} />
                            <Route path="pedidos/:id/edit" element={<EditOrderPage />} />
                            <Route path="categorias" element={<CategoriesPage />} />
                            <Route path="productos" element={<AdminProductsPage />} />
                            <Route path="mesas" element={<MesasPage />} />
                          </Route>
                          <Route path="pedidos/:id/receipt" element={<ReceiptPage mode="admin" />} />
                        </Route>
                      </Routes>
                  } />
                </Routes>
                <Toaster richColors position="bottom-right" />
              </Router>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}

export default App;
