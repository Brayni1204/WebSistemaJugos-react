import { Link } from 'react-router-dom';
import { ShoppingCart, User as UserIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext'; // Import the useTenant hook

const Navbar = () => {
  const { cartItemsCount } = useCart();
  const { user } = useAuth();
  const { tenantInfo, isLoading: isTenantLoading } = useTenant(); // Use the tenant hook

  return (
    <nav className="bg-background text-foreground border-b border-border shadow-sm fixed top-0 left-0 right-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-22.5">

          {/* Logo */}
          <div className="min-w-37.5">
            <Link to="/" className="flex items-center">
              {isTenantLoading ? (
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : tenantInfo?.logo_url ? (
                <img className="h-16 w-auto" src={tenantInfo.logo_url} alt={tenantInfo.name || 'Logo'} />
              ) : (
                <span className="text-xl font-bold">{tenantInfo?.name || ''}</span>
              )}
            </Link>
          </div>

          {/* Menu for large screens */}
          <div className="hidden sm:block">
            <div className="flex justify-center gap-6 lg:gap-10">
              <Link to="/productos" className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
                Productos
              </Link>
              <Link to="/nosotros" className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
                Nosotros
              </Link>
              <Link to="/novedades" className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
                Novedades
              </Link>
              {/* Dynamic pages will be added later */}
            </div>
          </div>

          {/* Icons and Auth section */}
          <div className="flex items-center pr-2 gap-6">
            {/* Cart Icon */}
            <div className="relative">
              <Link to="/carrito" className="relative p-2 rounded-full text-foreground hover:bg-accent">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Auth section */}
            <div className="relative">
              {user ? (
                <Link to="/perfil" className="flex items-center gap-2 p-2 rounded-full text-foreground hover:bg-accent">
                  <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </Link>
              ) : (
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-primary hover:underline">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button will be added later */}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
