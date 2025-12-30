// src/components/admin/categories/CategoryModal.tsx
import { useState, useEffect } from 'react';
import type { Category } from '@/api/categoryApi';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryData: FormData, id?: number) => void;
    category: Category | null;
    isLoading: boolean;
}

const CategoryModal = ({ isOpen, onClose, onSave, category, isLoading }: CategoryModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(1);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (category) {
            setName(category.nombre_categoria);
            setDescription(category.descripcion || '');
            setStatus(category.status);
            setImagePreview(category.imageUrl);
        } else {
            // Reset form for new category
            setName('');
            setDescription('');
            setStatus(1);
            setImage(null);
            setImagePreview(null);
        }
    }, [category, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre_categoria', name);
        formData.append('descripcion', description);
        formData.append('status', String(status));
        if (image) {
            formData.append('imagen', image);
        }
        onSave(formData, category?.id);
    };

    if (!isOpen) {
        return null;
    }

    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={formInputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className={formInputStyle}
                        />
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Estado
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                            className={formInputStyle}
                        >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imagen</label>
                        <div className="mt-1 flex items-center space-x-4">
                            {imagePreview ? 
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-md object-cover" /> :
                                <div className="h-16 w-16 rounded-md bg-gray-100 border border-gray-200"></div>
                            }
                            <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm text-gray-500"/>
                        </div>
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

export default CategoryModal;
