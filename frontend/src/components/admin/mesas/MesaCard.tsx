// src/components/admin/mesas/MesaCard.tsx
import type { Mesa } from '@/api/mesaApi';
import { cn } from '@/lib/utils';
import { QrCode, Trash2, Edit } from 'lucide-react';

interface MesaCardProps {
    mesa: Mesa;
    canManage: boolean;
    onDelete: (id: number) => void;
    onShowQr: (mesa: Mesa) => void;
}

const statusClasses: Record<Mesa['estado'], string> = {
    disponible: 'bg-green-100 text-green-800',
    ocupada: 'bg-yellow-100 text-yellow-800',
    reservada: 'bg-blue-100 text-blue-800',
};

const MesaCard = ({ mesa, canManage, onDelete, onShowQr }: MesaCardProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center gap-2 text-center">
            <h4 className="text-lg font-bold text-gray-800">Mesa {mesa.numero_mesa}</h4>
            
            <span className={cn(
                'px-3 py-1 text-xs font-semibold rounded-full',
                statusClasses[mesa.estado]
            )}>
                {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
            </span>

            <div className="flex items-center gap-1 mt-2">
                {canManage && (
                    <>
                        <button onClick={() => onShowQr(mesa)} className="p-2 text-gray-500 hover:text-gray-900" title="Mostrar QR">
                            <QrCode className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(mesa.id)} className="p-2 text-gray-500 hover:text-red-600" title="Eliminar Mesa">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MesaCard;
