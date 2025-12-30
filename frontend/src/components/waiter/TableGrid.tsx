import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as waiterApi from '@/api/waiterApi';
import { AlertTriangle, Coffee } from 'lucide-react';

const TableGrid = () => {
    const navigate = useNavigate();
    const { data: tables, isLoading, isError, error } = useQuery<waiterApi.Table[]>({
        queryKey: ['waiterTables'],
        queryFn: waiterApi.getTables,
        staleTime: 1000 * 30,
    });

    if (isLoading) return (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Coffee className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
            </div>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando Salón...</span>
        </div>
    );

    if (isError) return (
        <div className="bg-red-50 border border-red-100 p-8 rounded-4xl text-center max-w-md mx-auto">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-red-900 font-bold text-lg">Error de conexión</h3>
            <p className="text-red-600/70 text-sm mt-2">{error?.message}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {tables?.map((table) => {
                const hasPendingOrder = table.pedidos && table.pedidos.length > 0;

                return (
                    <button
                        key={table.id}
                        onClick={() => navigate(`/mesero/mesa/${table.id}`)}
                        className={`group relative p-6 rounded-4xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center aspect-square border-2 ${hasPendingOrder
                            ? 'bg-amber-50 border-amber-200 shadow-amber-100'
                            : 'bg-white border-slate-100 shadow-slate-100'
                            }`}
                    >
                        <span className={`text-4xl font-black ${hasPendingOrder ? 'text-amber-600' : 'text-slate-800'}`}>
                            {table.numero_mesa}
                        </span>
                        <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${hasPendingOrder ? 'bg-amber-200 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {hasPendingOrder ? 'Ocupada' : 'Libre'}
                        </div>

                        {/* Indicador visual de hover */}
                        <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 font-bold text-[10px] uppercase">
                            Abrir Mesa →
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default TableGrid;