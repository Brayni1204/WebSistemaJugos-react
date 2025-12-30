// src/pages/admin/pedidos/ReceiptPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminOrderById } from '@/api/orderApi';
import { getReceiptOrder } from '@/api/waiterApi'; // New API for waiter
import type { Pedido } from '@/api/profileApi';
import { useTenant } from '@/contexts/TenantContext';
import { useSessionStorage } from '@/hooks/useSessionStorage'; // For waiter token

interface ReceiptPageProps {
    mode: 'admin' | 'waiter';
}

const ReceiptPage = ({ mode }: ReceiptPageProps) => {
    // Admin route uses :id, waiter route uses :orderId
    const { id, orderId: orderIdFromParams } = useParams<{ id?: string; orderId?: string }>();
    const orderId = Number(id || orderIdFromParams);
    const navigate = useNavigate();

    const { tenantInfo } = useTenant();
    const [order, setOrder] = useState<Pedido | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get waiter token from session storage, only needed for waiter mode
    const [waiterToken] = useSessionStorage<string | null>('waiterToken', null);

    useEffect(() => {
        const fetchAndPrint = async () => {
            const errorNavPath = mode === 'admin' ? '/admin/pedidos' : '/mesero';
            
            if (isNaN(orderId)) {
                console.error("Invalid Order ID");
                navigate(errorNavPath);
                return;
            }

            try {
                let data: Pedido;
                if (mode === 'admin') {
                    data = await getAdminOrderById(orderId);
                } else {
                    if (!waiterToken) {
                        throw new Error("No waiter session found. Please login via PIN again.");
                    }
                    data = await getReceiptOrder(waiterToken, orderId);
                }
                
                setOrder(data);
                // Data is loaded, now trigger print
                setTimeout(() => window.print(), 500); 
            } catch (error) {
                console.error(`Failed to load order for receipt in ${mode} mode:`, error);
                navigate(errorNavPath);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAndPrint();
    }, [orderId, navigate, mode, waiterToken]);

    if (isLoading || !order || !tenantInfo) {
        return <p className="p-10 text-center">Cargando recibo...</p>;
    }

    return (
        <div className="bg-white text-black p-8 font-mono max-w-sm mx-auto">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl font-bold">{tenantInfo.name}</h1>
                <p className="text-sm">{tenantInfo.address}</p>
                <p className="text-sm">{tenantInfo.contact_phone}</p>
            </div>
            
            <div className="border-t border-b border-dashed border-black py-2 mb-4">
                <div className="flex justify-between">
                    <span>Pedido ID:</span>
                    <span>#{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Hora:</span>
                    <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Mesa:</span>
                    <span>{order.mesa?.numero_mesa || 'N/A'}</span>
                </div>
            </div>

            <table className="w-full text-sm mb-4">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="py-1 text-left">Cant.</th>
                        <th className="py-1 text-left">Item</th>
                        <th className="py-1 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.detalle_pedidos.map(item => (
                        <tr key={item.id}>
                            <td className="py-1">{item.cantidad}</td>
                            <td className="py-1">{item.nombre_producto}</td>
                            <td className="py-1 text-right">S/ {Number(item.precio_total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-dashed border-black pt-4">
                 <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>S/ {Number(order.total_pago).toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center mt-8 text-xs">
                <p>¡Gracias por su compra!</p>
            </div>
        </div>
    );
};

export default ReceiptPage;
