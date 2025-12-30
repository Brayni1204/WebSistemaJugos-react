// src/pages/admin/proveedores/ProveedoresPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '@/api/proveedorApi';
import type { Proveedor } from '@/api/proveedorApi';
import { toast } from 'sonner';
// I will create these components in the next steps
import ProveedoresTable from '@/components/admin/proveedores/ProveedoresTable';
import ProveedorModal from '@/components/admin/proveedores/ProveedorModal';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const ProveedoresPage = () => {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

    const { hasPermission } = useAdminAuth();
    // I will add this permission to the backend seed script later
    const canManage = hasPermission('manage-proveedores') || hasPermission('Admin');

    const fetchProveedores = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getProveedores();
            setProveedores(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch suppliers.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    const handleOpenModal = (proveedor: Proveedor | null) => {
        setEditingProveedor(proveedor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProveedor(null);
    };

    const handleSave = async (data: Omit<Proveedor, 'id'>, id?: number) => {
        setIsSaving(true);
        try {
            if (id) {
                await updateProveedor(id, data);
                toast.success('Supplier updated successfully.');
            } else {
                await createProveedor(data);
                toast.success('Supplier created successfully.');
            }
            handleCloseModal();
            fetchProveedores();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save supplier.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteProveedor(id);
                toast.success('Supplier deleted successfully.');
                fetchProveedores();
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete supplier.');
            }
        }
    };

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
                {canManage && (
                    <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">
                        + Nuevo Proveedor
                    </button>
                )}
            </div>
            <div className="mt-4">
                {isLoading ? <p>Loading...</p> : 
                    <ProveedoresTable proveedores={proveedores} onEdit={handleOpenModal} onDelete={handleDelete} canManage={canManage} />
                }
            </div>
            {canManage && (
                <ProveedorModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} isLoading={isSaving} proveedor={editingProveedor} />
            )}
        </div>
    );
};

export default ProveedoresPage;
