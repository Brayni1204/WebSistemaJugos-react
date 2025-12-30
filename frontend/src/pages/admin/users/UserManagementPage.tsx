// src/pages/admin/users/UserManagementPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser } from '@/api/userManagementApi';
import { getRoles } from '@/api/roleApi';
import type { ManagedUser, UserPayload } from '@/api/userManagementApi';
import type { Role } from '@/api/roleApi';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Zod schema for validation
const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    pin: z.string().optional(),
    roleIds: z.array(z.number()).min(1, "At least one role is required"),
});

const UserManagementPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
    const queryClient = useQueryClient();
    const { hasPermission } = useAdminAuth();
    const canManage = hasPermission('manage-users');

    const { data: users = [], isLoading, isError, error } = useQuery<ManagedUser[]>({
        queryKey: ['adminUsers'],
        queryFn: getUsers,
    });

    // Effect to show toast on error
    useEffect(() => {
        if (isError) {
            toast.error((error as Error).message || 'Failed to fetch users.');
        }
    }, [isError, error]);

    const handleOpenModal = (user: ManagedUser | null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                {canManage && (
                    <Button onClick={() => handleOpenModal(null)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Usuario
                    </Button>
                )}
            </div>
            <div className="mt-4">
                {isLoading ? <p>Loading users...</p> : 
                    <UsersTable users={users} canManage={canManage} onEdit={handleOpenModal} />
                }
            </div>
             {isModalOpen && canManage && (
                <UserFormModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    user={selectedUser}
                    onSuccess={() => {
                        handleCloseModal();
                        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                    }}
                />
            )}
        </div>
    );
};

// ... UsersTable component remains the same ...
const UsersTable = ({ users, canManage, onEdit }: { users: ManagedUser[], canManage: boolean, onEdit: (user: ManagedUser) => void }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Nombre</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Email</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Roles</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{user.name}</td>
                            <td className="p-3 text-gray-600">{user.email}</td>
                            <td className="p-3 text-gray-600">
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map(role => <span key={role.id} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{role.name}</span>)}
                                </div>
                            </td>
                            <td className="p-3 text-right">
                                {canManage && (
                                    <button onClick={() => onEdit(user)} className="p-2 text-gray-500 hover:text-gray-900"><Edit className="h-4 w-4" /></button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


const UserFormModal = ({ isOpen, onClose, user, onSuccess }: { isOpen: boolean, onClose: () => void, user: ManagedUser | null, onSuccess: () => void }) => {
    const isEditMode = Boolean(user);
    const { data: allRoles = [] } = useQuery({ queryKey: ['allRoles'], queryFn: getRoles });

    const { register, handleSubmit, control, formState: { errors } } = useForm<UserPayload>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            pin: '',
            roleIds: user?.roles.map(r => r.id) || [],
        },
    });

    const mutation = useMutation({
        mutationFn: (data: UserPayload) => {
            const payload: Partial<UserPayload> = { ...data };
            if (!payload.password) delete payload.password;
            if (!payload.pin) delete payload.pin;

            if (isEditMode && user) {
                return updateUser(user.id, payload);
            }
            return createUser(payload as UserPayload); // In create mode, all fields are required by schema
        },
        onSuccess: () => {
            toast.success(isEditMode ? 'Usuario actualizado.' : 'Usuario creado.');
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.message || (isEditMode ? 'Failed to update user.' : 'Failed to create user.'));
        }
    });

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-gray-900 bg-opacity-75 backdrop-blur-sm fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg w-[90vw] max-w-md z-50">
                    <Dialog.Title className="text-lg font-medium text-gray-900">{isEditMode ? `Edit ${user?.name}` : 'Crear Nuevo Usuario'}</Dialog.Title>
                    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''} />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="pin">PIN (para mozos)</Label>
                            <Input id="pin" type="password" {...register('pin')} placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''} />
                            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
                        </div>
                        <div>
                            <Label>Roles</Label>
                            <Controller
                                name="roleIds"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                                        {allRoles.map(role => (
                                            <label key={role.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value.includes(role.id)}
                                                    onChange={() => {
                                                        const newValue = field.value.includes(role.id)
                                                            ? field.value.filter(id => id !== role.id)
                                                            : [...field.value, role.id];
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                {role.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                            {errors.roleIds && <p className="text-red-500 text-xs mt-1">{errors.roleIds.message}</p>}
                        </div>
                         <div className="mt-6 flex justify-end space-x-3">
                            <Dialog.Close asChild><Button type="button" variant="outline">Cancel</Button></Dialog.Close>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Usuario')}
                            </Button>
                        </div>
                    </form>
                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close"><X className="h-4 w-4" /></button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default UserManagementPage;
