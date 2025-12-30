// src/components/admin/products/ComponenteModal.tsx
import { useState } from 'react';

interface ComponenteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    isLoading: boolean;
}

const ComponenteModal = ({ isOpen, onClose, onSave, isLoading }: ComponenteModalProps) => {
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('El nombre del componente es requerido.');
            return;
        }
        await onSave(name);
        setName(''); // Reset name after saving
    };

    if (!isOpen) {
        return null;
    }
    
    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";

    return (
        // Using a higher z-index (z-60) to appear on top of the ProductModal (z-50)
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm z-60 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Crear Nuevo Ingrediente
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="componente-name" className="block text-sm font-medium text-gray-700">
                            Nombre del Ingrediente
                        </label>
                        <input
                            type="text"
                            id="componente-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={formInputStyle}
                            placeholder="Ej: Fresa, Leche, Azúcar"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComponenteModal;
