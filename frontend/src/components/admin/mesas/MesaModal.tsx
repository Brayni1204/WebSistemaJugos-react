// src/components/admin/mesas/MesaModal.tsx
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface MesaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    isLoading: boolean;
}

const MesaModal = ({ isOpen, onClose, onSave, isLoading }: MesaModalProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The backend will now auto-generate the number
        onSave();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-gray-900 bg-opacity-75 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
                <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none w-[90vw] max-w-sm z-50">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                        Confirmar Nueva Mesa
                    </Dialog.Title>
                     <Dialog.Description className="mt-2 text-sm text-gray-600">
                        ¿Estás seguro de que quieres añadir una nueva mesa? El número se asignará automáticamente.
                    </Dialog.Description>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div className="mt-6 flex justify-end space-x-3">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors">
                                    Cancelar
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Añadiendo...' : 'Añadir Mesa'}
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

export default MesaModal;
