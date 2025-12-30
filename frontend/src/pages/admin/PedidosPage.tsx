// src/pages/admin/PedidosPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { http } from '@/lib/apiClient';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import Pagination from '@/components/common/Pagination';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Define the Order type based on backend model
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
interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface GetOrdersResponse {
  data: Order[];
  pagination: PaginationData;
}

const PedidosPage = () => {
  const { hasPermission } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToggle, setRefreshToggle] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params:any = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter) {
          params.estado = statusFilter;
      }
      if (searchTerm) {
          params.search = searchTerm;
      }
      const response = await http.get<GetOrdersResponse>('/admin/pedidos', { params, authType: 'admin' });
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchOrders();
    }, 500); // Debounce search term

    return () => clearTimeout(timer);
  }, [fetchOrders, refreshToggle]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleOrderUpdate = () => {
    setRefreshToggle(prev => !prev);
  }

  return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Lista de Pedidos</h3>
              {hasPermission('manage-orders') && (
                <Link to="/admin/pedidos/crear" className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                    + Nuevo Pedido
                </Link>
              )}
          </div>
          <div className="mt-4">
              <div className="flex flex-col md:flex-row justify-start items-center gap-4">
                  <div className="w-full md:w-auto">
                      <input 
                          type="text" 
                          className="w-full md:w-64 border-gray-300 rounded-lg shadow-sm focus:border-gray-400 focus:ring-gray-400" 
                          placeholder="Buscar por cliente o ID..." 
                          autoComplete="off"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  
                  <div className="w-full md:w-auto">
                      <select 
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1); // Reset to first page on filter change
                        }}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-400 focus:ring-gray-400"
                      >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                  </div>
              </div>
          </div>
          <div className="mt-4">
              {isLoading && <p>Cargando pedidos...</p>}
              {error && <p className="text-red-500">{error}</p>}
              
              {!isLoading && !error && (
                  <>
                    <OrdersTable orders={orders} onOrderUpdate={handleOrderUpdate} />
                    {pagination && pagination.totalPages > 1 && (
                       <Pagination 
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                       />
                    )}
                  </>
              )}
          </div>
      </div>
  );
};

export default PedidosPage;
