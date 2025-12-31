// src/pages/admin/novedades/AdminNovedadesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getNovedades, deleteNovedad, createNovedad, updateNovedad } from '@/api/novedadesApi';
import type { Novedad } from '@/api/novedadesApi';
import { toast } from 'sonner';
import NovedadModal from '@/components/admin/novedades/NovedadModal';

const AdminNovedadesPage = () => {
    const [novedades, setNovedades] = useState<Novedad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshToggle, setRefreshToggle] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNovedad, setEditingNovedad] = useState<Novedad | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getNovedades();
            setNovedades(data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch data.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshToggle]);

    const handleRefresh = () => {
        setRefreshToggle(prev => !prev);
    };

    // Modal Handlers
    const handleOpenModal = (novedad: Novedad | null) => {
        setEditingNovedad(novedad);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNovedad(null);
    };

    // Save/Delete Handlers
    const handleSave = async (novedadData: Omit<Novedad, 'id' | 'createdAt' | 'updatedAt'>, id?: number) => {
        setIsSaving(true);
        try {
            if (id) {
                await updateNovedad(id, novedadData);
                toast.success('Novedad actualizada exitosamente!');
            } else {
                await createNovedad(novedadData);
                toast.success('Novedad creada exitosamente!');
            }
            handleCloseModal();
            handleRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al guardar la novedad.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta novedad?')) {
            try {
                await deleteNovedad(id);
                toast.success('Novedad eliminada exitosamente!');
                handleRefresh();
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar la novedad.');
            }
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">Gestión de Novedades</h3>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                    + Nueva Novedad
                </button>
            </div>
            
            <div className="mt-4">
                {isLoading && <p>Cargando novedades...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publicado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {novedades.map((novedad) => (
                                    <tr key={novedad.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{novedad.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{novedad.published ? 'Sí' : 'No'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(novedad.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenModal(novedad)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                            <button onClick={() => handleDelete(novedad.id)} className="ml-4 text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <NovedadModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSave} 
                novedad={editingNovedad} 
                isLoading={isSaving} 
            />
        </div>
    );
};

export default AdminNovedadesPage;
