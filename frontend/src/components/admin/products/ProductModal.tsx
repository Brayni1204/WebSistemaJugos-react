// src/components/admin/products/ProductModal.tsx
import { useState, useEffect } from 'react';
import type { Product } from '@/api/productsApi';
import type { Category } from '@/api/categoryApi';
import type { Componente } from '@/api/componenteApi';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: FormData, id?: number) => void;
    product: Product | null;
    categories: Category[];
    allComponentes: Componente[];
    onAddNewComponente: () => void;
    isLoading: boolean;
}

const ProductModal = ({ isOpen, onClose, onSave, product, categories, allComponentes, onAddNewComponente, isLoading }: ProductModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [stock, setStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [status, setStatus] = useState(1);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedComponentes, setSelectedComponentes] = useState<Set<number>>(new Set());
    const [tracksStock, setTracksStock] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.nombre_producto);
                setDescription(product.descripcion || '');
                setCategoryId(product.id_categoria);
                setStock(product.stock);
                setPrice(Number(product.precio_venta));
                setPurchasePrice(Number(product.precio_compra));
                setStatus(product.status);
                setTracksStock(product.tracks_stock);
                setImagePreview(product.imageUrl);
                setSelectedComponentes(new Set(product.componentes?.map(c => c.id) || []));
            } else {
                setName('');
                setDescription('');
                setCategoryId(categories.length > 0 ? categories[0].id : '');
                setStock(0);
                setPrice(0);
                setPurchasePrice(0);
                setStatus(1);
                setTracksStock(true);
                setImage(null);
                setImagePreview(null);
                setSelectedComponentes(new Set());
            }
        }
    }, [product, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleComponenteToggle = (componenteId: number) => {
        setSelectedComponentes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(componenteId)) {
                newSet.delete(componenteId);
            } else {
                newSet.add(componenteId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryId === '') {
            alert('Please select a category.');
            return;
        }
        const formData = new FormData();
        formData.append('nombre_producto', name);
        formData.append('descripcion', description);
        formData.append('id_categoria', String(categoryId));
        formData.append('stock', String(stock));
        formData.append('precio_venta', String(price));
        formData.append('precio_compra', String(purchasePrice));
        formData.append('status', String(status));
        formData.append('tracks_stock', String(tracksStock));
        formData.append('componenteIds', JSON.stringify(Array.from(selectedComponentes)));

        if (image) {
            formData.append('imagen', image);
        }
        
        onSave(formData, product?.id);
    };

    if (!isOpen) {
        return null;
    }
    
    const formInputStyle = "mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select id="category" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} required className={formInputStyle}>
                                <option value="" disabled>Seleccione una categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre_categoria}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio Venta</label>
                            <input type="number" step="0.01" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className={formInputStyle} />
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex-1">
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                                <input 
                                    type="number" 
                                    id="stock" 
                                    value={stock} 
                                    onChange={(e) => setStock(Number(e.target.value))} 
                                    required 
                                    className={formInputStyle}
                                    disabled={!tracksStock}
                                />
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <input 
                                    id="tracks-stock" 
                                    type="checkbox"
                                    checked={tracksStock}
                                    onChange={(e) => setTracksStock(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                                />
                                <label htmlFor="tracks-stock" className="ml-2 block text-sm text-gray-700">Controlar Stock</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">Selecciona los ingredientes de este producto.</p>
                            <button type="button" onClick={onAddNewComponente} className="text-sm text-gray-600 hover:text-gray-900 font-semibold">+ Añadir Nuevo</button>
                        </div>
                        <div className="mt-2 p-3 border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-gray-50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {allComponentes.map(comp => (
                                    <label key={comp.id} className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedComponentes.has(comp.id)}
                                            onChange={() => handleComponenteToggle(comp.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                                        />
                                        <span>{comp.nombre_componente}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={formInputStyle} />
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
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors">{isLoading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
