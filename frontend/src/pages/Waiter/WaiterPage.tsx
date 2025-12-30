/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import * as waiterApi from '@/api/waiterApi';
import { Toaster, toast } from 'sonner';
import TableGrid from '@/components/waiter/TableGrid';
import OrderView from '@/components/waiter/OrderView';
import PinModal from '@/components/waiter/PinModal';
import { useSessionStorage } from '@/hooks/useSessionStorage';

const WaiterPage = () => {
    const { tableId } = useParams<{ tableId?: string }>();
    const navigate = useNavigate();

    const [waiterToken, setWaiterToken] = useSessionStorage<string | null>('waiterToken', null);
    const [waiterUser, setWaiterUser] = useSessionStorage<waiterApi.WaiterUser | null>('waiterUser', null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    
    useEffect(() => {
        if (tableId && !waiterToken) {
            setIsPinModalOpen(true);
        } else {
            // Also close the modal if the condition is no longer met (e.g., navigating back)
            setIsPinModalOpen(false);
        }
    }, [tableId, waiterToken]);

    const pinMutation = useMutation({
        mutationFn: waiterApi.verifyPin,
        onSuccess: (data) => {
            toast.success(`¡Bienvenido, ${data.user.name}!`);
            setWaiterToken(data.token);
            setWaiterUser(data.user);
            setIsPinModalOpen(false);
        },
        onError: (error: any) => toast.error(error.message || 'PIN Incorrecto'),
    });

    const handlePinSubmit = (pin: string) => {
        pinMutation.mutate({ pin });
    };
    
    const handleLogout = () => {
        setWaiterToken(null);
        setWaiterUser(null);
        navigate('/mesero');
        toast.info('Sesión cerrada');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
            {isPinModalOpen && (
                <PinModal 
                    onSubmit={handlePinSubmit} 
                    isLoading={pinMutation.isPending} 
                    onClose={() => {
                        setIsPinModalOpen(false);
                        if (!waiterToken) navigate('/mesero');
                    }}
                />
            )}

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white/60 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-800">
                                {!tableId ? 'Panel de Mesas' : `Mesa ${tableId}`}
                            </h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistema de Mozos</p>
                        </div>
                    </div>

                    {waiterUser && (
                        <div className="flex items-center gap-3 bg-slate-100/50 p-2 pr-5 rounded-2xl border border-slate-200/50">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold shadow-sm border border-slate-100">
                                {waiterUser.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 leading-none">{waiterUser.name}</span>
                                <button onClick={handleLogout} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase mt-1 transition-colors">Cerrar Sesión</button>
                            </div>
                        </div>
                    )}
                </header>

                <main className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                    {tableId && waiterToken ? (
                        <OrderView
                            table={{ id: parseInt(tableId), numero_mesa: parseInt(tableId) } as waiterApi.Table}
                            onBack={() => navigate('/mesero')}
                            waiterToken={waiterToken}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <TableGrid />
                    )}
                </main>
            </div>
            <Toaster expand={false} richColors position="bottom-right" />
        </div>
    );
};

export default WaiterPage;
