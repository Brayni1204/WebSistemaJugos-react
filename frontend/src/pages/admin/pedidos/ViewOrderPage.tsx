// src/pages/admin/pedidos/ViewOrderPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminOrderById } from '@/api/orderApi';
import type { Pedido } from '@/api/profileApi';
import { toast } from 'sonner';

const ViewOrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const orderId = Number(id);
    const navigate = useNavigate();

    const [order, setOrder] = useState<Pedido | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isNaN(orderId)) {
            toast.error("ID de pedido inválido.");
            navigate('/admin/pedidos');
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminOrderById(orderId);
                setOrder(data);
            } catch (error: any) {
                toast.error(error.message || "Error al cargar el pedido.");
                navigate('/admin/pedidos');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, navigate]);

    if (isLoading) return <p>Cargando pedido...</p>;
    if (!order) return <p>Pedido no encontrado.</p>;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Detalle del Pedido #{order.id}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <Link to="/admin/pedidos" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                    &larr; Volver a Pedidos
                </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h4 className="font-bold text-lg mb-2 text-gray-700">Ítems del Pedido</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-600">Producto</th>
                                    <th className="p-3 text-center font-semibold text-gray-600">Cantidad</th>
                                    <th className="p-3 text-right font-semibold text-gray-600">Precio Unit.</th>
                                    <th className="p-3 text-right font-semibold text-gray-600">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.detalle_pedidos.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-3 text-gray-800">{item.nombre_producto}</td>
                                        <td className="p-3 text-center text-gray-600">{item.cantidad}</td>
                                        <td className="p-3 text-right text-gray-600">S/ {Number(item.precio_unitario).toFixed(2)}</td>
                                        <td className="p-3 text-right font-medium text-gray-800">S/ {Number(item.precio_total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-lg mb-4 text-gray-700">Resumen</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className="font-semibold capitalize text-gray-800">{order.estado}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Cliente:</span>
                            <span className="font-semibold text-gray-800">{order.cliente?.nombre || 'N/A'}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Tipo:</span>
                            <span className="font-semibold text-gray-800">{order.metodo_entrega}</span>
                        </div>
                        {order.mesa && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Mesa:</span>
                                <span className="font-semibold text-gray-800">{order.mesa.numero_mesa}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-3 mt-3">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-gray-900">S/ {Number(order.total_pago).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderPage;