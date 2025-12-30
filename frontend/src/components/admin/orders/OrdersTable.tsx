/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { http } from '@/lib/apiClient';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { toast } from 'sonner';
import { Eye, Edit, XCircle, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Cliente {
  nombre: string | null;
}

interface Order {
  id: number;
  cliente: Cliente | null;
  created_at: string;
  total_pago: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  metodo_entrega: string;
  metodo_pago: string | null;
  mesa_id: number | null;
}

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

const statusClasses: Record<Order['estado'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
};

const OrdersTable = ({ orders, onOrderUpdate }: OrdersTableProps) => {
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
    };

    const handleCancelOrderClick = (orderId: number) => {
        setOrderToCancel(orderId);
        setIsCancelDialogOpen(true);
    };

    const confirmCancelOrder = async () => {
        if (!orderToCancel) return;
        
        try {
            await http.patch(`/admin/orders/${orderToCancel}/status`, { estado: "cancelado" });
            toast.success("El pedido ha sido cancelado.");
            onOrderUpdate();
        } catch (error) {
            toast.error("Hubo un problema al cancelar el pedido.");
        } finally {
            setIsCancelDialogOpen(false);
        }
    };

    const handlePrintReceipt = (orderId: number) => {
        toast.info(`Imprimiendo ticket para el pedido ${orderId}`);
    };

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Cliente</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Mesa/Entrega</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">#{order.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{order.cliente?.nombre ?? 'Datos Reservados'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">S/ {Number(order.total_pago).toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={cn('px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', statusClasses[order.estado])}>
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                   {order.metodo_entrega === 'delivery' ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Delivery</span>
                  ) : (
                      `Mesa - ${order.mesa_id ?? 'N/A'}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex justify-center items-center gap-2">
                      <Link to={`/admin/pedidos/${order.id}/edit`} className={cn('p-2 text-gray-400 hover:text-gray-800', {'pointer-events-none opacity-40': order.estado === 'cancelado' || order.estado === 'completado'})}>
                          <Edit className="h-4 w-4" />
                      </Link>
                      <Link to={`/admin/pedidos/${order.id}`} className="p-2 text-gray-400 hover:text-gray-800">
                          <Eye className="h-4 w-4" />
                      </Link>
                      <button
                          className={cn('p-2 text-gray-400 hover:text-red-600', {'pointer-events-none opacity-40': order.estado === 'cancelado' || order.estado === 'completado'})}
                          onClick={() => handleCancelOrderClick(order.id)}
                          disabled={order.estado === 'cancelado' || order.estado === 'completado'}
                      >
                          <XCircle className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-800" onClick={() => handlePrintReceipt(order.id)}>
                          <Printer className="h-4 w-4" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancelOrder}
        title="¿Estás seguro?"
        description="Esta acción marcará el pedido como 'Cancelado' y no se puede deshacer."
        confirmButtonText="Sí, cancelar pedido"
      />
    </>
  );
};
export default OrdersTable;