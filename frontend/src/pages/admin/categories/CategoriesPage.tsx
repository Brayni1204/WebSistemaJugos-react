// src/pages/admin/categories/CategoriesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categoryApi';
import type { Category } from '@/api/categoryApi';
import Pagination from '@/components/common/Pagination';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';
import CategoryModal from '@/components/admin/categories/CategoryModal';
import { toast } from 'sonner';

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshToggle, setRefreshToggle] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = { page: currentPage, limit: 10 };
            if (searchTerm) {
                params.search = searchTerm;
            }
            const response = await getCategories(params);
            setCategories(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories.');
            toast.error(err.message || 'Failed to fetch categories.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchCategories, refreshToggle]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        setRefreshToggle(prev => !prev);
    };

    const handleOpenModal = (category: Category | null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = async (categoryData: FormData, id?: number) => {
        setIsSaving(true);
        try {
            if (id) {
                await updateCategory(id, categoryData);
                toast.success('Categoría actualizada exitosamente!');
            } else {
                await createCategory(categoryData);
                toast.success('Categoría creada exitosamente!');
            }
            handleCloseModal();
            handleRefresh();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al guardar la categoría.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            try {
                await deleteCategory(id);
                toast.success('Categoría eliminada exitosamente!');
                handleRefresh();
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar la categoría.');
            }
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h3>
            </div>
            <div className="mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto">
                        <input
                            type="text"
                            className="w-full md:w-64 border-gray-300 rounded-lg shadow-sm focus:border-gray-400 focus:ring-gray-400"
                            placeholder="Buscar categoría..."
                            autoComplete="off"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="w-full md:w-auto">
                        <button onClick={() => handleOpenModal(null)} className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                            + Nueva Categoría
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {isLoading && <p>Cargando categorías...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <>
                        <CategoriesTable categories={categories} onEdit={(cat) => handleOpenModal(cat)} onDelete={handleDeleteCategory} />
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

            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCategory}
                category={editingCategory}
                isLoading={isSaving}
            />
        </div>
    );
};

export default CategoriesPage;