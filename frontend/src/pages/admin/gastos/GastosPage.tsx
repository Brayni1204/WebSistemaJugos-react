// src/pages/admin/compras/GastosPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getGastos } from '@/api/gastoApi';
import type { Gasto } from '@/api/gastoApi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const GastosPage = () => {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { hasPermission } = useAdminAuth();

    const canManage = hasPermission('manage-gastos') || hasPermission('Admin');

    const fetchGastos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getGastos();
            setGastos(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch expenses.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGastos();
    }, [fetchGastos]);

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Compras y Gastos</h2>
                {canManage && (
                    <Link to="/admin/gastos/nueva" className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">
                        + Nuevo Gasto
                    </Link>
                )}
            </div>
            <div className="mt-4">
                {isLoading ? (
                    <p>Loading expenses...</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-600">ID</th>
                                    <th className="p-3 text-left font-semibold text-gray-600">Proveedor</th>
                                    <th className="p-3 text-left font-semibold text-gray-600">Fecha</th>
                                    <th className="p-3 text-center font-semibold text-gray-600">Items</th>
                                    <th className="p-3 text-right font-semibold text-gray-600">Monto Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {gastos.map(gasto => (
                                    <tr key={gasto.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">#{gasto.id}</td>
                                        <td className="p-3 text-gray-600">{gasto.proveedor?.name || 'N/A'}</td>
                                        <td className="p-3 text-gray-600">{new Date(gasto.date).toLocaleDateString()}</td>
                                        <td className="p-3 text-center text-gray-600">{gasto._count?.items}</td>
                                        <td className="p-3 text-right font-medium text-gray-800">S/ {Number(gasto.total_amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GastosPage;
