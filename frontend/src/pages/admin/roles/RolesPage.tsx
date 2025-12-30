// src/pages/admin/roles/RolesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getRoles, deleteRole, createRole } from '@/api/roleApi';
import type { Role } from '@/api/roleApi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';

import { useAdminAuth } from '@/contexts/AdminAuthContext';

const RolesPage = () => {
    const { hasPermission } = useAdminAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newRoleName, setNewRoleName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch roles.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this role? This cannot be undone.')) {
            try {
                await deleteRole(id);
                toast.success('Role deleted successfully.');
                fetchRoles();
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete role.');
            }
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) {
            toast.error('Role name cannot be empty.');
            return;
        }
        setIsSaving(true);
        try {
            await createRole(newRoleName);
            toast.success(`Role '${newRoleName}' created successfully.`);
            setNewRoleName('');
            fetchRoles();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create role.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Roles y Permisos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                {/* Role List Table */}
                <div className="md:col-span-2">
                     <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-600">Nombre del Rol</th>
                                    <th className="p-3 text-center font-semibold text-gray-600">Usuarios</th>
                                    <th className="p-3 text-center font-semibold text-gray-600">Permisos</th>
                                    <th className="p-3 text-right font-semibold text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
                                ) : (
                                    roles.map(role => (
                                        <tr key={role.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{role.name}</td>
                                            <td className="p-3 text-center text-gray-600">{role._count?.users}</td>
                                            <td className="p-3 text-center text-gray-600">{role._count?.permissions}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {hasPermission('manage-roles') ? (
                                                        <>
                                                            <Link to={`/admin/roles/${role.id}`} className="p-2 text-gray-500 hover:text-gray-900"><Edit className="h-4 w-4" /></Link>
                                                            {role.name !== 'Admin' && (
                                                                <button onClick={() => handleDelete(role.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No actions</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create New Role Form */}
                {hasPermission('manage-roles') && (
                    <div>
                        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-2">Crear Nuevo Rol</h3>
                            <p className="text-xs text-gray-500 mb-4">Crea un nuevo rol y luego asígnale permisos.</p>
                            <label htmlFor="new-role-name" className="sr-only">Nombre del Rol</label>
                            <input
                                id="new-role-name"
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Nombre del nuevo rol"
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500"
                            />
                            <button type="submit" disabled={isSaving} className="mt-3 w-full px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors">
                                {isSaving ? 'Creando...' : 'Crear Rol'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RolesPage;
