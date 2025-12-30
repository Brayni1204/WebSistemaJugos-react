// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCart as fetchCartApi, addItemToCart as addItemApi, updateCartItemQuantity as updateItemApi, removeItemFromCart as removeItemApi, clearCart as clearCartApi } from '@/api/cartApi';
import type { Cart, CartItem } from '@/api/cartApi';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
    cart: Cart | null;
    cartItemsCount: number;
    cartTotal: number;
    isLoading: boolean;
    error: string | null;
    refreshCart: () => void;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshCart = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setCart(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const fetchedCart = await fetchCartApi();
            setCart(fetchedCart);
        } catch (err: any) {
            console.error('Error fetching cart:', err);
            setError(err.message || 'Error al cargar el carrito.');
            setCart(null);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user, refreshTrigger]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = async (productId: number, quantity: number = 1) => {
        if (!isAuthenticated) {
            toast.error('Debes iniciar sesión para añadir productos al carrito.');
            return;
        }
        try {
            await addItemApi(productId, quantity);
            toast.success('Producto añadido al carrito.');
            refreshCart();
        } catch (err: any) {
            toast.error(err.message || 'Error al añadir producto al carrito.');
            throw err;
        }
    };

    const updateItemQuantity = async (itemId: number, quantity: number) => {
        if (!isAuthenticated) return;
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }
        try {
            await updateItemApi(itemId, quantity);
            toast.success('Cantidad actualizada.');
            refreshCart();
        } catch (err: any) {
            toast.error(err.message || 'Error al actualizar cantidad.');
            throw err;
        }
    };

    const removeItem = async (itemId: number) => {
        if (!isAuthenticated) return;
        try {
            await removeItemApi(itemId);
            toast.success('Producto eliminado del carrito.');
            refreshCart();
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar producto.');
            throw err;
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;
        try {
            await clearCartApi();
            toast.success('Carrito vaciado.');
            refreshCart();
        } catch (err: any) {
            toast.error(err.message || 'Error al vaciar el carrito.');
            throw err;
        }
    };

    const cartItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const cartTotal = cart?.items.reduce((sum, item) => sum + item.quantity * Number(item.producto.precio_venta), 0) || 0;

    const value = {
        cart,
        cartItemsCount,
        cartTotal,
        isLoading,
        error,
        refreshCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
