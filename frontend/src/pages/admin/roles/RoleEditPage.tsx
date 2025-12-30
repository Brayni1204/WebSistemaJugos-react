// src/pages/admin/roles/RoleEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRoleById, updateRole, getAllPermissions, type Role, type Permission } from '@/api/roleApi';
import { toast } from 'sonner';

const RoleEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const roleId = Number(id);
    const navigate = useNavigate();

    const [role, setRole] = useState<Role | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [assignedPermissions, setAssignedPermissions] = useState<Set<number>>(new Set());
    const [roleName, setRoleName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [roleData, permissionsData] = await Promise.all([
                    getRoleById(roleId),
                    getAllPermissions(),
                ]);
                setRole(roleData);
                setRoleName(roleData.name);
                setAllPermissions(permissionsData);
                setAssignedPermissions(new Set(roleData.permissions.map(p => p.id)));
            } catch (error: any) {
                toast.error(error.message || 'Failed to load data.');
                navigate('/admin/roles');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [roleId, navigate]);

    const handlePermissionToggle = (permissionId: number) => {
        setAssignedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateRole(roleId, roleName, Array.from(assignedPermissions));
            toast.success("Role updated successfully!");
            navigate('/admin/roles');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save role.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <p>Loading role details...</p>;
    }

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Editando Rol</h2>
                    <p className="text-gray-500">Modifica el nombre y los permisos para el rol.</p>
                </div>
                 <Link to="/admin/roles" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                    &larr; Volver a Roles
                </Link>
            </div>

            <div className="mt-6">
                <div className="mb-6">
                    <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">Nombre del Rol</label>
                    <input
                        id="role-name"
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="mt-1 block w-full max-w-md border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500"
                        disabled={role?.name === 'Admin'}
                    />
                     {role?.name === 'Admin' && <p className="text-xs text-gray-500 mt-1">The 'Admin' role name cannot be changed.</p>}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Permisos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        {allPermissions.map(permission => (
                            <label key={permission.id} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                                    checked={assignedPermissions.has(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                    disabled={role?.name === 'Admin'}
                                />
                                <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                            </label>
                        ))}
                    </div>
                     {role?.name === 'Admin' && <p className="text-xs text-gray-500 mt-2">The 'Admin' role automatically has all permissions.</p>}
                </div>
            </div>

             <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving || role?.name === 'Admin'}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default RoleEditPage;
