// src/pages/admin/pedidos/CreateOrderPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMesas } from '@/api/mesaApi';
import { getPublicProducts } from '@/api/productsApi';
import { createAdminOrder } from '@/api/orderApi';
import type { Mesa } from '@/api/mesaApi';
import type { Product } from '@/api/productsApi';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';

const CreateOrderPage = () => {
    const navigate = useNavigate();
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedMesa, setSelectedMesa] = useState<number | ''>('');
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [mesasData, productsData] = await Promise.all([
                    getMesas(),
                    getPublicProducts({ limit: 1000 })
                ]);
                setMesas(mesasData.filter((m: Mesa) => m.estado === 'disponible'));
                setAllProducts(productsData.data);
                const initial = productsData.data.slice(0, 5);
                setInitialProducts(initial);
                setSearchResults(initial);
            } catch (error) {
                toast.error("Error al cargar datos iniciales.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
        setOrderItems(prev => 
            prev.map(item => 
                item.producto_id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const removeItem = (productId: number) => {
        setOrderItems(prev => prev.filter(item => item.producto_id !== productId));
    };
    
    const subtotal = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.quantity * Number(item.precio_venta)), 0);
    }, [orderItems]);

    const handleSubmitOrder = async () => {
        if (!selectedMesa) {
            toast.error("Por favor, selecciona una mesa.");
            return;
        }
        if (orderItems.length === 0) {
            toast.error("Añade al menos un producto al pedido.");
            return;
        }
        
        setIsSaving(true);
        try {
            await createAdminOrder({
                mesa_id: Number(selectedMesa),
                items: orderItems,
                subtotal: subtotal,
                total_pago: subtotal,
            });
            toast.success("Pedido creado exitosamente.");
            navigate('/admin/pedidos');
        } catch (error: any) {
            toast.error(error.message || "Error al crear el pedido.");
        } finally {
            setIsSaving(false);
        }
    };

    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500";

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">Crear Nuevo Pedido</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="mb-4">
                        <label htmlFor="mesa-select" className="block text-sm font-medium text-gray-600">Seleccionar Mesa</label>
                        <select
                            id="mesa-select"
                            value={selectedMesa}
                            onChange={(e) => setSelectedMesa(Number(e.target.value))}
                            className={formInputStyle}
                            disabled={isLoading}
                        >
                            <option value="" disabled>Selecciona una mesa disponible...</option>
                            {mesas.map(mesa => (
                                <option key={mesa.id} value={mesa.id}>Mesa {mesa.numero_mesa}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 mt-4 min-h-[200px]">
                        <h4 className="font-semibold text-lg mb-4 text-gray-700">Ítems del Pedido</h4>
                        <div className="space-y-3">
                            {orderItems.length === 0 && <p className="text-gray-500 text-sm">Añade productos desde la búsqueda...</p>}
                            {orderItems.map(item => (
                                <div key={item.producto_id} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-800">{item.nombre_producto}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.producto_id, -1)} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100">-</button>
                                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.producto_id, 1)} className="h-6 w-6 border rounded-md flex items-center justify-center hover:bg-gray-100">+</button>
                                        <button onClick={() => removeItem(item.producto_id)} className="ml-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
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

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-6">
                <div>
                    <span className="text-lg font-bold text-gray-700">Total: </span>
                    <span className="text-2xl font-bold text-gray-900">S/ {subtotal.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleSubmitOrder}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? 'Guardando...' : 'Guardar Pedido'}
                </button>
            </div>
        </div>
    );
};

export default CreateOrderPage;