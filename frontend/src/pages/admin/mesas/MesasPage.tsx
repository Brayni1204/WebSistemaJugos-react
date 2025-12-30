// src/pages/admin/mesas/MesasPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getMesas, createMesa, deleteMesa } from '@/api/mesaApi';
import type { Mesa } from '@/api/mesaApi';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import MesaCard from '@/components/admin/mesas/MesaCard';
import MesaModal from '@/components/admin/mesas/MesaModal';
import QrCodeModal from '@/components/admin/mesas/QrCodeModal';

const MesasPage = () => {
    const { hasPermission } = useAdminAuth();
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal states
    const [isMesaModalOpen, setIsMesaModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

    const fetchMesas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMesas();
            setMesas(data);
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar las mesas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMesas();
    }, [fetchMesas]);

    const handleCreateMesa = async () => {
        setIsSaving(true);
        try {
            const newMesa = await createMesa();
            toast.success(`Mesa #${newMesa.numero_mesa} creada exitosamente.`);
            setIsMesaModalOpen(false);
            fetchMesas();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la mesa.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteMesa = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
            try {
                await deleteMesa(id);
                toast.success('Mesa eliminada.');
                fetchMesas();
            } catch (error: any) {
                toast.error(error.message || 'Error al eliminar la mesa.');
            }
        }
    };
    
    const handleShowQr = (mesa: Mesa) => {
        setSelectedMesa(mesa);
        setIsQrModalOpen(true);
    };

    const canManage = hasPermission('manage-mesas');

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">Gestión de Mesas</h3>
                {canManage && (
                    <button 
                        onClick={() => setIsMesaModalOpen(true)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                    >
                        + Añadir Mesa
                    </button>
                )}
            </div>
            
            {isLoading ? (
                <p className="p-6">Cargando mesas...</p>
            ) : (
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mesas.map(mesa => (
                        <MesaCard 
                            key={mesa.id} 
                            mesa={mesa} 
                            canManage={canManage}
                            onDelete={handleDeleteMesa}
                            onShowQr={handleShowQr}
                        />
                    ))}
                </div>
            )}
            
            {canManage && (
                <MesaModal 
                    isOpen={isMesaModalOpen}
                    onClose={() => setIsMesaModalOpen(false)}
                    onSave={handleCreateMesa}
                    isLoading={isSaving}
                />
            )}
            
            <QrCodeModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                mesa={selectedMesa}
            />
        </div>
    );
};

export default MesasPage;
