// src/pages/admin/pedidos/EditOrderPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminOrderById, updateAdminOrder } from '@/api/orderApi';
import { getPublicProducts } from '@/api/productsApi';
import type { Pedido, OrderItem } from '@/api/profileApi';
import type { Product } from '@/api/productsApi';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Search, Plus, Minus, Trash2, Printer, XCircle, Save } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const EditOrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const orderId = Number(id);
    const navigate = useNavigate();
    const { user } = useAdminAuth();

    const [order, setOrder] = useState<Pedido | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (isNaN(orderId)) {
            toast.error("ID de pedido inválido.");
            navigate('/admin/pedidos');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [orderData, productsData] = await Promise.all([
                    getAdminOrderById(orderId),
                    getPublicProducts({ limit: 1000 })
                ]);
                setOrder(orderData);
                setOrderItems(orderData.detalle_pedidos.map((item: OrderItem) => ({
                    producto_id: item.producto_id,
                    nombre_producto: item.nombre_producto,
                    quantity: item.cantidad,
                    precio_venta: item.precio_unitario,
                })));
                setAllProducts(productsData.data);
                setInitialProducts(productsData.data.slice(0, 5));
                setSearchResults(productsData.data.slice(0, 5));
            } catch (error: any) {
                toast.error(error.message || "Error al cargar los datos.");
                navigate('/admin/pedidos');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [orderId, navigate]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setSearchResults(
                allProducts.filter(p => 
                    p.nombre_producto.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                )
            );
        } else {
            setSearchResults(initialProducts);
        }
    }, [debouncedSearchTerm, allProducts, initialProducts]);

    const addProductToOrder = (product: Product) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.producto_id === product.id);
            if (existingItem) {
                return prevItems.map(item => 
                    item.producto_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { 
                producto_id: product.id, 
                nombre_producto: product.nombre_producto,
                quantity: 1, 
                precio_venta: product.precio_venta 
            }];
        });
        setSearchTerm('');
    };

    const updateQuantity = (productId: number, delta: number) => {
        setOrderItems(prev => {
            const newItems = prev.map(item =>
                item.producto_id === productId ? { ...item, quantity: item.quantity + delta } : item
            );
            return newItems.filter(item => item.quantity > 0);
        });
    };
    
    const removeItem = (productId: number) => {
        setOrderItems(prev => prev.filter(item => item.producto_id !== productId));
    };
    
    const subtotal = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.quantity * Number(item.precio_venta)), 0);
    }, [orderItems]);

    const handleSubmit = async (newStatus: 'pendiente' | 'completado' | 'cancelado') => {
        if (orderItems.length === 0) {
            toast.error("Un pedido no puede estar vacío.");
            return;
        }
        
        setIsSaving(true);
        try {
            await updateAdminOrder(orderId, {
                estado: newStatus,
                items: orderItems,
                subtotal: subtotal,
                total_pago: subtotal,
            });
            toast.success(`Pedido ${newStatus}.`);

            if (newStatus === 'completado') {
                // Open receipt in a new tab for printing
                window.open(`/admin/pedidos/${orderId}/receipt`, '_blank');
            }

            navigate('/admin/pedidos');
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el pedido.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500";
    const isOrderClosed = order?.estado === 'completado' || order?.estado === 'cancelado';

    if (isLoading) return <p>Cargando pedido...</p>;

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                     <h3 className="text-2xl font-bold text-gray-800">Editar Pedido #{order?.id}</h3>
                     <p className="text-sm text-gray-500">Mesa: {order?.mesa?.numero_mesa || 'N/A'}</p>
                </div>
                <Link to="/admin/pedidos" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    &larr; Volver
                </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Left side: Order details and items */}
                <div>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-50">
                        <h4 className="font-semibold text-lg mb-4 text-gray-700">Ítems del Pedido</h4>
                        <div className="space-y-3">
                            {orderItems.length === 0 && <p className="text-gray-500 text-sm">Añade productos desde la búsqueda...</p>}
                            {orderItems.map(item => (
                                <div key={item.producto_id} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-800">{item.nombre_producto}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.producto_id, -1)} disabled={isOrderClosed} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">-</button>
                                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.producto_id, 1)} disabled={isOrderClosed} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">+</button>
                                        <button onClick={() => removeItem(item.producto_id)} disabled={isOrderClosed} className="ml-2 text-gray-400 hover:text-red-500 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side: Product search and results */}
                <div className={isOrderClosed ? 'opacity-50 pointer-events-none' : ''}>
                     <div className="relative">
                        <label htmlFor="product-search" className="block text-sm font-medium text-gray-600 mb-1">Buscar Producto</label>
                        <Search className="absolute left-3 top-10 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="product-search"
                            type="text"
                            placeholder="Buscar producto para añadir..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 ${formInputStyle}`}
                            disabled={isOrderClosed}
                        />
                    </div>
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                        {searchResults.map(product => (
                            <div 
                                key={product.id}
                                onClick={() => addProductToOrder(product)}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <p className="font-medium text-gray-800">{product.nombre_producto}</p>
                                <p className="text-sm text-gray-500">S/ {Number(product.precio_venta).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer with totals and action buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-4">
                <div className="mr-auto">
                    <span className="text-lg font-bold text-gray-700">Total: </span>
                    <span className="text-2xl font-bold text-gray-900">S/ {subtotal.toFixed(2)}</span>
                </div>
                
                {!isOrderClosed && (
                  <>
                    {user?.roles.some(r => r.name === 'Admin') && (
                        <button type="button" onClick={() => handleSubmit('cancelado')} disabled={isSaving} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors flex items-center gap-2">
                            <XCircle className="h-4 w-4"/> Cancelar Pedido
                        </button>
                    )}
                    <button onClick={() => handleSubmit('pendiente')} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2">
                        <Save className="h-4 w-4"/> Actualizar Pedido
                    </button>
                    <button onClick={() => handleSubmit('completado')} disabled={isSaving} className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center gap-2">
                        <Printer className="h-4 w-4"/> Completar e Imprimir
                    </button>
                  </>
                )}
                 {isOrderClosed && (
                    <p className="text-sm font-medium text-gray-500">Este pedido ya fue {order.estado}.</p>
                )}
            </div>
        </div>
    );
};

export default EditOrderPage;
