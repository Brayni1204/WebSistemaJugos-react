// src/components/admin/proveedores/ProveedorModal.tsx
import { useState, useEffect } from 'react';
import type { Proveedor } from '@/api/proveedorApi';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ProveedorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Proveedor, 'id'>, id?: number) => void;
    proveedor: Proveedor | null;
    isLoading: boolean;
}

const ProveedorModal = ({ isOpen, onClose, onSave, proveedor, isLoading }: ProveedorModalProps) => {
    const [name, setName] = useState('');
    const [ruc, setRuc] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (proveedor) {
            setName(proveedor.name);
            setRuc(proveedor.ruc || '');
            setEmail(proveedor.email || '');
            setPhone(proveedor.phone || '');
            setAddress(proveedor.address || '');
        } else {
            setName('');
            setRuc('');
            setEmail('');
            setPhone('');
            setAddress('');
        }
    }, [proveedor, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, ruc, email, phone, address }, proveedor?.id);
    };

    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";
    const formLabelStyle = "block text-sm font-medium text-gray-700";

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-gray-900 bg-opacity-75 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
                <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none w-[90vw] max-w-lg z-50">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                        {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className={formLabelStyle}>Nombre</label>
                                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={formInputStyle} />
                            </div>
                            <div>
                                <label htmlFor="ruc" className={formLabelStyle}>RUC</label>
                                <input id="ruc" value={ruc} onChange={(e) => setRuc(e.target.value)} className={formInputStyle} />
                            </div>
                            <div>
                                <label htmlFor="email" className={formLabelStyle}>Email</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={formInputStyle} />
                            </div>
                            <div>
                                <label htmlFor="phone" className={formLabelStyle}>Teléfono</label>
                                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={formInputStyle} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className={formLabelStyle}>Dirección</label>
                            <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={formInputStyle} />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
                            </Dialog.Close>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50">
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close">
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ProveedorModal;
