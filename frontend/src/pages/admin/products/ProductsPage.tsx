// src/pages/admin/products/ProductsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct } from '@/api/productsApi';
import { getComponentes, createComponente } from '@/api/componenteApi';
import type { Product } from '@/api/productsApi';
import type { Category } from '@/api/categoryApi';
import type { Componente } from '@/api/componenteApi';
import { getCategories } from '@/api/categoryApi';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductModal from '@/components/admin/products/ProductModal';
import ComponenteModal from '@/components/admin/products/ComponenteModal';

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [componentes, setComponentes] = useState<Componente[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshToggle, setRefreshToggle] = useState(false);

    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isComponenteModalOpen, setIsComponenteModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const productParams = { page: currentPage, limit: 10, search: searchTerm };
            // Fetch all data in parallel
            const [productResponse, categoryResponse, componenteResponse] = await Promise.all([
                getProducts(productParams),
                getCategories({ limit: 100 }),
                getComponentes(),
            ]);
            setProducts(productResponse.data);
            setPagination(productResponse.pagination);
            setCategories(categoryResponse.data);
            setComponentes(componenteResponse);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch data.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchData, refreshToggle]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        setRefreshToggle(prev => !prev);
    };

    // Product Modal Handlers
    const handleOpenProductModal = (product: Product | null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    // Componente Modal Handlers
    const handleOpenComponenteModal = () => {
        setIsComponenteModalOpen(true);
    };

    const handleCloseComponenteModal = () => {
        setIsComponenteModalOpen(false);
    };

    const handleSaveNewComponente = async (name: string) => {
        setIsSaving(true);
        try {
            await createComponente({ nombre_componente: name });
            toast.success('Ingrediente creado! Refrescando lista...');
            handleCloseComponenteModal();
            // Refetch all data to get the new component in the list
            handleRefresh();
        } catch (err: any) {
            toast.error(err.message || 'Error al crear el ingrediente.');
        }
        finally {
            setIsSaving(false);
        }
    };

    // Main Save/Delete Handlers
    const handleSaveProduct = async (productData: FormData, id?: number) => {
        setIsSaving(true);
        try {
            if (id) {
                await updateProduct(id, productData);
                toast.success('Producto actualizado exitosamente!');
            } else {
                await createProduct(productData);
                toast.success('Producto creado exitosamente!');
            }
            handleCloseProductModal();
            handleRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al guardar el producto.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                toast.success('Producto eliminado exitosamente!');
                handleRefresh();
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar el producto.');
            }
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">Gestión de Productos</h3>
            </div>
            <div className="mt-4">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto">
                        <input
                            type="text"
                            className="w-full md:w-64 border-gray-300 rounded-lg shadow-sm focus:border-gray-400 focus:ring-gray-400"
                            placeholder="Buscar producto..."
                            autoComplete="off"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="w-full md:w-auto">
                        <button onClick={() => handleOpenProductModal(null)} className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                            + Nuevo Producto
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {isLoading && <p>Cargando productos...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <>
                        <ProductsTable products={products} onEdit={handleOpenProductModal} onDelete={handleDeleteProduct} />
                        {pagination && pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
            
            <ProductModal 
                isOpen={isProductModalOpen} 
                onClose={handleCloseProductModal} 
                onSave={handleSaveProduct} 
                product={editingProduct} 
                categories={categories} 
                allComponentes={componentes}
                onAddNewComponente={handleOpenComponenteModal}
                isLoading={isSaving} 
            />

            <ComponenteModal
                isOpen={isComponenteModalOpen}
                onClose={handleCloseComponenteModal}
                onSave={handleSaveNewComponente}
                isLoading={isSaving}
            />
        </div>
    );
};

export default ProductsPage;