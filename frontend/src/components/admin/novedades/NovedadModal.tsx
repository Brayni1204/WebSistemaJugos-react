// src/components/admin/novedades/NovedadModal.tsx
import { useState, useEffect, useMemo } from 'react';
import type { Novedad } from '@/api/novedadesApi';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface NovedadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (novedadData: Omit<Novedad, 'id' | 'createdAt' | 'updatedAt'>, id?: number) => void;
    novedad: Novedad | null;
    isLoading: boolean;
}

const NovedadModal = ({ isOpen, onClose, onSave, novedad, isLoading }: NovedadModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(false);
    // For now, we'll handle imageUrl as a text input. A file upload could be added later.
    const [imageUrl, setImageUrl] = useState('');
    
    const mdeOptions = useMemo(() => {
        return {
            autofocus: true,
            spellChecker: false,
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (novedad) {
                setTitle(novedad.title);
                setContent(novedad.content);
                setPublished(novedad.published);
                setImageUrl(novedad.imageUrl || '');
            } else {
                setTitle('');
                setContent('');
                setPublished(false);
                setImageUrl('');
            }
        }
    }, [novedad, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const novedadData = {
            title,
            content,
            published,
            imageUrl,
        };
        onSave(novedadData, novedad?.id);
    };

    if (!isOpen) {
        return null;
    }
    
    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {novedad ? 'Editar Novedad' : 'Crear Nueva Novedad'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={formInputStyle} />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contenido</label>
                        <SimpleMDE value={content} onChange={setContent} options={mdeOptions} />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL de la Imagen (Opcional)</label>
                        <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={formInputStyle} />
                    </div>
                    <div className="flex items-center">
                        <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700" />
                        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">Publicado</label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors">{isLoading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NovedadModal;
