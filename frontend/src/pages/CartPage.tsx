// src/pages/CartPage.tsx
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { XCircle, PlusCircle, MinusCircle, Trash2 } from 'lucide-react';

const CartPage = () => {
  const { cart, cartItemsCount, cartTotal, isLoading, error, updateItemQuantity, removeItem, clearCart } = useCart();

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando carrito...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 py-12 text-center bg-card rounded-lg shadow-lg">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Parece que no has añadido nada a tu carrito. ¡Explora nuestros productos!</p>
        <Link to="/productos" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-foreground mb-6">Tu Carrito ({cartItemsCount} {cartItemsCount === 1 ? 'ítem' : 'ítems'})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-border py-4 last:border-b-0">
                <Link to={`/productos/${item.producto.id}`} className="shrink-0">
                  <img
                    src={item.producto.imageUrl || 'https://via.placeholder.com/80'}
                    alt={item.producto.nombre_producto}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </Link>
                <div className="grow">
                  <Link to={`/productos/${item.producto.id}`} className="text-lg font-semibold text-foreground hover:underline">
                    {item.producto.nombre_producto}
                  </Link>
                  <p className="text-muted-foreground text-sm">S/ {Number(item.producto.precio_venta).toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    <MinusCircle className="h-5 w-5" />
                  </button>
                  <span className="text-foreground font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="font-semibold text-foreground w-20 text-right">
                  S/ {(item.quantity * Number(item.producto.precio_venta)).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
            <button
              onClick={clearCart}
              className="px-4 py-2 text-sm text-destructive border border-destructive rounded-md hover:bg-destructive/10"
            >
              Vaciar Carrito
            </button>
            <Link to="/productos" className="px-4 py-2 text-sm text-primary hover:underline">
              Seguir comprando
            </Link>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1 bg-muted p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-bold text-foreground mb-4">Resumen del Pedido</h2>
          <div className="space-y-2 text-foreground">
            <div className="flex justify-between">
              <span>Subtotal ({cartItemsCount} {cartItemsCount === 1 ? 'ítem' : 'ítems'})</span>
              <span>S/ {cartTotal.toFixed(2)}</span>
            </div>
            {/* Add shipping, taxes etc. here later */}
            <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
              <span>Total</span>
              <span>S/ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground rounded-md text-lg font-semibold hover:bg-primary/90">
            Proceder al Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
