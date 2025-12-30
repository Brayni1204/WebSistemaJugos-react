// src/components/admin/proveedores/ProveedoresTable.tsx
import type { Proveedor } from '@/api/proveedorApi';
import { Edit, Trash2 } from 'lucide-react';

interface ProveedoresTableProps {
    proveedores: Proveedor[];
    canManage: boolean;
    onEdit: (proveedor: Proveedor) => void;
    onDelete: (id: number) => void;
}

const ProveedoresTable = ({ proveedores, canManage, onEdit, onDelete }: ProveedoresTableProps) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Nombre</th>
                        <th className="p-3 text-left font-semibold text-gray-600">RUC</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Email</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Teléfono</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {proveedores.map(proveedor => (
                        <tr key={proveedor.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{proveedor.name}</td>
                            <td className="p-3 text-gray-600">{proveedor.ruc}</td>
                            <td className="p-3 text-gray-600">{proveedor.email}</td>
                            <td className="p-3 text-gray-600">{proveedor.phone}</td>
                            <td className="p-3 text-right">
                                {canManage && (
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onEdit(proveedor)} className="p-2 text-gray-500 hover:text-gray-900"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => onDelete(proveedor.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProveedoresTable;
