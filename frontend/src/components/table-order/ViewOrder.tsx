/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/table-order/ViewOrder.tsx
import { useState, useMemo } from 'react';
import { useTableOrder } from '@/contexts/TableOrderContext';
import { ShoppingBag, X, RefreshCw, ChefHat, Receipt, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { placePublicOrder } from '@/api/orderApi';
import { toast } from 'sonner';

const ViewOrder = () => {
    const {
        items,
        itemsCount,
        totalPrice,
        tableUuid,
        clearOrder,
        previouslyOrderedItems,
        isLoadingPreviouslyOrdered,
        refreshPreviouslyOrdered,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
    } = useTableOrder();

    const [isOpen, setIsOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const totalPreviouslyOrdered = useMemo(() => {
        return previouslyOrderedItems.reduce((sum, item) => sum + Number(item.precio_total), 0);
    }, [previouslyOrderedItems]);

    const grandTotal = totalPrice + totalPreviouslyOrdered;

    // Si no hay nada de nada y está cerrado, no renderizamos
    if (itemsCount === 0 && previouslyOrderedItems.length === 0 && !isOpen) {
        return null;
    }

    const handlePlaceOrder = async () => {
        if (!tableUuid || items.length === 0) {
            toast.error("No hay productos nuevos para pedir.");
            return;
        }

        setIsPlacingOrder(true);
        try {
            await placePublicOrder({
                table_uuid: tableUuid,
                items: items,
                subtotal: totalPrice,
                total_pago: totalPrice,
            });
            toast.success("¡Pedido enviado a cocina!");
            clearOrder();
            refreshPreviouslyOrdered();
        } catch (error: any) {
            toast.error(error.message || "Error al realizar el pedido.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Componente para items viejos (Estilo Ticket/Recibo antiguo)
    const PreviouslyOrderedItem = ({ item }: { item: any }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 opacity-80 grayscale-[0.3]">
            <img
                src={item.producto?.imageUrl || `https://ui-avatars.com/api/?name=${item.nombre_producto.charAt(0)}&background=random`}
                alt={item.nombre_producto}
                className="h-12 w-12 rounded-md object-cover shadow-sm"
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-700 truncate">{item.nombre_producto}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono">x{item.cantidad}</span>
                    <span>S/ {Number(item.precio_unitario).toFixed(2)}</span>
                </div>
            </div>
            <p className="font-semibold text-sm text-gray-600">S/ {Number(item.precio_total).toFixed(2)}</p>
        </div>
    );

    // Componente para items NUEVOS (Estilo Card Vibrante)
    const CurrentOrderItem = ({ item }: { item: any }) => (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group">
             <img
                src={item.imageUrl || `https://ui-avatars.com/api/?name=${item.nombre_producto.charAt(0)}&background=random`}
                alt={item.nombre_producto}
                className="h-16 w-16 rounded-lg object-cover shadow-md"
            />
            <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-sm sm:text-base text-gray-800">{item.nombre_producto}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="font-mono">S/ {Number(item.precio_venta).toFixed(2)}</span>
                </div>
                 <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => decreaseQuantity(item.id)} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100">-</button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100">+</button>
                </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
                <p className="font-bold text-gray-800 text-base">S/ {(item.quantity * Number(item.precio_venta)).toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );


    return (
        <>
            {/* --- FAB --- */}
            <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-10 duration-500">
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative group flex items-center justify-center h-16 w-16 rounded-full bg-gray-900 text-white shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-primary/50"
                >
                    <ShoppingBag className={cn("h-7 w-7 transition-transform", itemsCount > 0 && "group-hover:rotate-12")} />
                    {(itemsCount + previouslyOrderedItems.length) > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 border-2 border-white text-xs font-bold text-white shadow-sm animate-bounce">
                            {itemsCount + previouslyOrderedItems.reduce((acc, item) => acc + item.cantidad, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* --- OVERLAY --- */}
            <div
                onClick={() => setIsOpen(false)}
                className={cn(
                    "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            />

            {/* --- SIDE PANEL --- */}
            <aside
                className={cn(
                    "fixed top-0 right-0 z-50 h-full w-[95vw] sm:w-112.5 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
                    "bg-white flex flex-col", // FONDO BLANCO BASE
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* 1. Header (AHORA TOTALMENTE BLANCO) */}
                <div className="relative px-6 py-5 border-b border-gray-100 bg-white z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            Tu Comanda
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Mesa: <span className="font-mono font-medium text-gray-700">{tableUuid?.substring(0, 8) || '...'}</span></p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* 2. Scrollable Content (AHORA TOTALMENTE BLANCO) */}
                <div className="flex-1 overflow-y-auto bg-white p-4 space-y-6">

                    {/* HISTORIAL */}
                    {previouslyOrderedItems.length > 0 && (
                        <div className="animate-in fade-in duration-500 delay-100">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <ChefHat className="h-3 w-3" /> En cocina / Entregado
                                </h3>
                                <button
                                    onClick={refreshPreviouslyOrdered}
                                    disabled={isLoadingPreviouslyOrdered}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className={cn("h-3 w-3", isLoadingPreviouslyOrdered && "animate-spin")} />
                                    Actualizar
                                </button>
                            </div>
                            <div className="space-y-2">
                                {previouslyOrderedItems.map(item => <PreviouslyOrderedItem key={item.id} item={item} />)}
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-100 border-dashed"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-xs text-gray-400">Nuevo Pedido</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PEDIDO ACTUAL */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 min-h-25">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                            <ShoppingBag className="h-3 w-3" /> En el carrito
                        </h3>

                        {items.length > 0 ? (
                            <div className="space-y-3">
                                {items.map(item => <CurrentOrderItem key={item.id} item={item} />)}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl bg-white">
                                <div className="bg-gray-50 p-3 rounded-full inline-block shadow-sm mb-3">
                                    <ShoppingBag className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No hay productos nuevos</p>
                                <p className="text-xs text-gray-400 mt-1">¡Añade algo delicioso del menú!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Footer (AHORA TOTALMENTE BLANCO) */}
                <div className="border-t border-gray-100 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="space-y-3 mb-4">
                        {items.length > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal (Nuevos):</span>
                                <span className="font-medium">S/ {totalPrice.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end">
                            <span className="text-base font-semibold text-gray-900">Total Mesa</span>
                            <div className="text-right">
                                <span className="block text-2xl font-extrabold text-gray-900 tracking-tight">
                                    S/ {grandTotal.toFixed(2)}
                                </span>
                                {totalPreviouslyOrdered > 0 && items.length > 0 && (
                                    <span className="text-xs text-muted-foreground">Incluye pedidos anteriores</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || items.length === 0}
                        className={cn(
                            "w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
                            items.length > 0
                                ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isPlacingOrder ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                {items.length > 0 ? 'Confirmar Pedido' : 'Carrito Vacío'}
                                {items.length > 0 && <ArrowRight className="h-5 w-5" />}
                            </>
                        )}
                    </button>
                    {items.length > 0 && (
                        <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <ChefHat className="h-3 w-3" /> Se enviará directamente a cocina
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
};

export default ViewOrder;