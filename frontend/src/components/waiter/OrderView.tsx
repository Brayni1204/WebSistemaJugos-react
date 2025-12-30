/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/waiter/OrderView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as waiterApi from '@/api/waiterApi';
import { getPublicProducts } from '@/api/productsApi';
import { toast } from 'sonner';
import { Loader2, Plus, Minus, X, ShoppingBag, User, Printer, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrderViewProps {
    waiterToken: string;
    table: waiterApi.Table;
    onBack: () => void;
    onLogout: () => void; // New prop for logging out
}

type CartItem = {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    description?: string;
};

const OrderView = ({ waiterToken, table, onLogout }: OrderViewProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [cart, setCart] = useState<Record<number, CartItem>>({});
    const [customerName, setCustomerName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: activeOrder, isLoading: isLoadingOrder, refetch: refetchOrder } = useQuery({
        queryKey: ['activeOrder', table.id, waiterToken],
        queryFn: () => waiterApi.getActiveOrderForTable(waiterToken, table.id),
    });

    // When the order data loads, populate the customer name field
    useEffect(() => {
        if (activeOrder?.cliente?.nombre) {
            setCustomerName(activeOrder.cliente.nombre);
        }
    }, [activeOrder]);

    const { data: productsData } = useQuery({
        queryKey: ['publicProducts', searchTerm],
        queryFn: () => getPublicProducts({ search: searchTerm, limit: 100 }),
    });

    const availableProducts = productsData?.data || [];

    const addItemsMutation = useMutation({
        mutationFn: (payload: waiterApi.CreateOrderPayload) => waiterApi.createOrUpdateOrder(waiterToken, payload),
        onSuccess: () => {
            toast.success('Productos agregados correctamente');
            setCart({}); // Clear the cart
            queryClient.invalidateQueries({ queryKey: ['waiterTables'] }); // Invalidate tables to update status
            refetchOrder(); // Refetch the order to show new items
        },
        onError: (error: any) => toast.error(error.message || 'Error al agregar productos'),
    });

    const updateCustomerMutation = useMutation({
        mutationFn: (payload: { customerName: string }) => waiterApi.updateOrderCustomer(waiterToken, activeOrder!.id, payload),
        onSuccess: () => {
            toast.success('Nombre del cliente actualizado.');
            refetchOrder();
        },
        onError: (error: any) => toast.error(error.message || 'Error al actualizar cliente'),
    });


    // --- Cart Handlers ---
    const handleAddToCart = (product: waiterApi.Product) => { // ... (same as before)
        setCart(prev => {
            const existing = prev[product.id];
            return { ...prev, [product.id]: { productId: product.id, name: product.nombre_producto, quantity: (existing?.quantity || 0) + 1, price: Number(product.precio_venta) } };
        });
    };
    const handleIncrementQuantity = (productId: number) => { // ... (same as before)
        setCart(prev => { const e = prev[productId]; if (!e) return prev; return { ...prev, [productId]: { ...e, quantity: e.quantity + 1 } }; });
    };
    const handleDecrementQuantity = (productId: number) => { // ... (same as before)
        setCart(prev => { const e = prev[productId]; if (!e) return prev; if (e.quantity === 1) { const n = { ...prev }; delete n[productId]; return n; } return { ...prev, [productId]: { ...e, quantity: e.quantity - 1 } }; });
    };
    const handleRemoveItem = (productId: number) => { // ... (same as before)
        setCart(prev => { const n = { ...prev }; delete n[productId]; return n; });
    };
    const cartTotal = useMemo(() => Object.values(cart).reduce((t, i) => t + (i.price * i.quantity), 0), [cart]);


    // --- Action Handlers ---
    const handleSendToKitchen = () => {
        if (Object.keys(cart).length === 0) return toast.warning('Añade al menos un producto.');
        addItemsMutation.mutate({ tableId: table.id, items: Object.values(cart).map(i => ({ productId: i.productId, quantity: i.quantity })), customerName: customerName && !activeOrder?.cliente ? customerName : undefined });
    };

    const handleUpdateCustomer = () => {
        if (!activeOrder) return toast.error("No hay un pedido activo para actualizar.");
        if (!customerName) return toast.warning("El nombre del cliente no puede estar vacío.");
        updateCustomerMutation.mutate({ customerName });
    };

    const handlePrintBill = () => {
        if (activeOrder) navigate(`/recibo/${activeOrder.id}`);
        else toast.error("No se puede imprimir una cuenta para un pedido nuevo.");
    };


    if (isLoadingOrder) return (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600 h-10 w-10" /></div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Detalle */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingBag className="text-indigo-600 w-5 h-5" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Detalle del Pedido</h3>
                    </div>

                    {/* Pedido Actual */}
                    <div className="mb-4 bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">En cocina / Mesa</h4>
                            {activeOrder?.cliente && <span className="text-xs font-bold text-slate-500">Cliente: {activeOrder.cliente.nombre}</span>}
                        </div>
                        {activeOrder && activeOrder.detalle_pedidos.length > 0 ? (
                            <ul className="space-y-3">
                                {activeOrder.detalle_pedidos.map(item => (
                                    <li key={item.id} className="flex justify-between text-sm font-bold text-slate-600">
                                        <span>{item.cantidad}x {item.nombre_producto}</span>
                                        <span className="text-slate-400">S/ {Number(item.precio_total).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm font-medium text-slate-400 italic">No hay productos en el pedido actual.</p>
                        )}
                    </div>

                    {/* Nuevos Productos (Cart) */}
                    {Object.keys(cart).length > 0 && (
                        <div className="mb-4 bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">Nuevos para agregar</h4>
                            <ul className="space-y-2">
                                {Object.values(cart).map(item => (
                                    <li key={item.productId} className="flex justify-between items-center text-sm">
                                        <div><p className="font-bold text-slate-600">{item.name}</p></div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => handleDecrementQuantity(item.productId)}><Minus className="h-4 w-4" /></Button>
                                            <span className="font-bold w-5 text-center">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => handleIncrementQuantity(item.productId)}><Plus className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-500 rounded-full" onClick={() => handleRemoveItem(item.productId)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-right font-bold text-lg text-indigo-600 mt-4">Subtotal Nuevo: S/ {cartTotal.toFixed(2)}</p>
                        </div>
                    )}

                    {/* Formulario Cliente */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 text-slate-400"> <User className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Información Cliente</span> </div>
                        <div className="flex gap-2">
                            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del cliente" className="rounded-2xl border-slate-100 h-12 bg-slate-50/30 focus:bg-white transition-all" />
                            {activeOrder && (<Button variant="outline" size="icon" onClick={handleUpdateCustomer} disabled={updateCustomerMutation.isPending} className="h-12 w-12 rounded-2xl border-slate-200"><RefreshCw className="h-4 w-4" /></Button>)}
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="mt-8 space-y-3">
                        <Button onClick={handleSendToKitchen} disabled={addItemsMutation.isPending || Object.keys(cart).length === 0} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100">
                            {addItemsMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirmar y Enviar a Cocina'}
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handlePrintBill} disabled={!activeOrder} variant="outline" className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold"> <Printer className="h-4 w-4 mr-2" /> Imprimir Cuenta </Button>
                            <Button onClick={onLogout} variant="outline" className="w-full h-12 rounded-2xl border-slate-200 text-red-500 font-bold"> <LogOut className="h-4 w-4 mr-2" /> Volver y Salir </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Productos */}
            <div className="lg:col-span-7">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Añadir Productos</h3>
                        <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sm:max-w-50 rounded-2xl border-slate-100 bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {availableProducts.map(product => (
                            <button key={product.id} onClick={() => handleAddToCart(product)} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group text-left">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">{product.nombre_producto}</span>
                                    <span className="text-xs font-black text-indigo-500 mt-1">S/ {Number(product.precio_venta).toFixed(2)}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors"> <Plus className="w-4" /> </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderView;