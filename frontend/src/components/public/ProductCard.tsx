/* eslint-disable react-hooks/rules-of-hooks */
// src/components/public/ProductCard.tsx
import { Link, useLocation } from 'react-router-dom';
import type { Product } from '@/api/productsApi';
import { cn } from '@/lib/utils';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useTableOrder } from '@/contexts/TableOrderContext';

interface ProductCardProps {
    product: Product;
    isTableMenu?: boolean;
}

const ProductCard = ({ product, isTableMenu = false }: ProductCardProps) => {
    const location = useLocation();

    // Check the prop first, then fall back to URL check for safety
    const inTableMenu = isTableMenu || location.pathname.startsWith('/menu') || location.pathname.startsWith('/mesa');

    const regularCart = useCart();
    const tableOrder = inTableMenu ? useTableOrder() : null;

    const handleAddItem = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inTableMenu && tableOrder) {
            tableOrder.addItem(product);
        } else {
            regularCart.addItem(product.id);
        }
    };

    const cardContent = (
        <div
            className={cn(
                "group flex flex-col h-full",
                "bg-card rounded-lg border border-border",
                "transition-all duration-300 hover:shadow-md hover:border-primary/50"
            )}
        >
            <div className="block relative overflow-hidden rounded-t-lg">
                <div className={cn(
                    "aspect-square w-full bg-muted/50 flex items-center justify-center relative",
                    inTableMenu ? "p-2" : "p-6"
                )}>
                    <img
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        src={product.imageUrl || 'https://via.placeholder.com/300'}
                        alt={product.nombre_producto}
                    />
                </div>
            </div>

            <div className={cn("flex flex-col flex-1", inTableMenu ? "p-2" : "p-4")}>
                <h3
                    className={cn(
                        "font-bold text-foreground line-clamp-2",
                        inTableMenu ? "text-xs" : "text-sm"
                    )}
                    title={product.nombre_producto}
                >
                    {product.nombre_producto}
                </h3>

                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                    <span className={cn(
                        "font-extrabold text-foreground",
                        inTableMenu ? "text-sm" : "text-base"
                    )}>
                        S/ {Number(product.precio_venta).toFixed(2)}
                    </span>

                    <button
                        onClick={handleAddItem}
                        className={cn(
                            "group/btn relative flex items-center justify-center rounded-full bg-foreground text-background shadow-md hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300",
                            inTableMenu ? "h-8 w-8" : "h-9 w-9"
                        )}
                        title="Añadir al pedido"
                    >
                        <ShoppingCart className={cn("transition-transform group-hover/btn:scale-0 group-hover/btn:opacity-0 absolute", inTableMenu ? "h-3 w-3" : "h-4 w-4")} />
                        <Plus className={cn("scale-0 opacity-0 transition-transform group-hover/btn:scale-100 group-hover/btn:opacity-100 absolute", inTableMenu ? "h-4 w-4" : "h-5 w-5")} />
                    </button>
                </div>
            </div>
        </div>
    );

    if (inTableMenu) {
        return cardContent;
    }

    return (
        <Link to={`/productos/${product.id}`} className="block h-full">
            {cardContent}
        </Link>
    );
};

export default ProductCard;