/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ProductsPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { getPublicProducts } from '@/api/productsApi';
import { getPublicCategories } from '@/api/categoryApi';
import type { Product } from '@/api/productsApi';
import type { Category } from '@/api/categoryApi';
import Pagination from '@/components/common/Pagination';
import ProductCard from '@/components/public/ProductCard';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, ChevronRight, Search, XCircle } from 'lucide-react';

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ProductsPageProps {
    isTableMenu?: boolean;
}

const ProductsPage = ({ isTableMenu = false }: ProductsPageProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
    const [debouncedSearchTerm] = useDebounce(inputValue, 500);

    const selectedCategory = searchParams.get('categoria') || null;

    // Infinite scroll setup
    const { ref: loadMoreRef, inView } = useInView();
    const pageRef = useRef(1);


    useEffect(() => {
        // Reset products and page when filters change
        setProducts([]);
        pageRef.current = 1;
        setSearchParams(prev => {
            if (debouncedSearchTerm) {
                prev.set('search', debouncedSearchTerm);
            } else {
                prev.delete('search');
            }
            if (isTableMenu) {
                prev.delete('page');
            } else {
                prev.set('page', '1');
            }
            return prev;
        }, { replace: true });
    }, [debouncedSearchTerm, selectedCategory, setSearchParams, isTableMenu]);

    const fetchData = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const productParams: any = {
                page: page,
                limit: isTableMenu ? 12 : 12,
                search: debouncedSearchTerm
            };
            if (selectedCategory) {
                productParams.id_categoria = selectedCategory;
            }

            // Only fetch categories once on the initial load
            if (page === 1) {
                const categoryResponse = await getPublicCategories({ limit: 50 });
                setCategories(categoryResponse.data);
            }

            const productResponse = await getPublicProducts(productParams);

            setProducts(prev => page === 1 ? productResponse.data : [...prev, ...productResponse.data]);
            setPagination(productResponse.pagination);

        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch data.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, selectedCategory, isTableMenu]);

    // Initial data fetch
    useEffect(() => {
        fetchData(1);
    }, [debouncedSearchTerm, selectedCategory]);

    // Infinite scroll trigger
    useEffect(() => {
        if (isTableMenu && inView && !isLoading && pagination && pagination.page < pagination.totalPages) {
            pageRef.current = pagination.page + 1;
            fetchData(pageRef.current);
        }
    }, [inView, isLoading, pagination, fetchData, isTableMenu]);

    const handlePageChange = (page: number) => {
        setSearchParams(prev => {
            prev.set('page', String(page));
            return prev;
        }, { replace: true });
        setProducts([]); // Clear products before fetching new page
        pageRef.current = page;
        fetchData(page);
    };

    const handleCategoryClick = (categoryId: number | null) => {
        setSearchParams(prev => {
            if (categoryId === null) {
                prev.delete('categoria');
            } else {
                prev.set('categoria', String(categoryId));
            }
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const CategoryChips = () => (
        <div className="py-2 overflow-x-auto">
            <div className="flex flex-nowrap gap-2 px-4">
                <button onClick={() => handleCategoryClick(null)} className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap", !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700")}>
                    Todas
                </button>
                {categories.map(category => (
                    <button key={category.id} onClick={() => handleCategoryClick(category.id)} className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap", selectedCategory === String(category.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700")}>
                        {category.nombre_categoria}
                    </button>
                ))}
            </div>
        </div>
    );

    if (isTableMenu) {
        return (
            <div className="pb-24">
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                    <CategoryChips />
                </div>
                <main className="p-4">
                    <div className="min-h-100">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} isTableMenu={true} />
                                ))}
                            </div>
                        ) : !isLoading && (
                            <div className="text-center py-16">
                                <XCircle className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-semibold text-foreground">No hay productos</h3>
                            </div>
                        )}

                        <div ref={loadMoreRef} className="h-10 text-center">
                            {isLoading && <p>Cargando más...</p>}
                        </div>
                        {error && <div className="rounded-md bg-red-50 p-4 text-center text-red-700 border border-red-200">{error}</div>}
                    </div>
                </main>
            </div>
        )
    }

    // Original Desktop-focused Layout
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 dark:bg-background dark:text-foreground">
            <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-border">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground sm:text-4xl">
                        Nuestros Productos
                    </h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64 shrink-0 space-y-6">
                        <div className="lg:hidden relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Buscar..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-muted/50 border-b border-gray-200 dark:border-border">
                                <h2 className="font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4" /> Categorías
                                </h2>
                            </div>
                            <div className="p-2 space-y-1">
                                <button onClick={() => handleCategoryClick(null)} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-gray-600 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted")}>
                                    <span>Todas</span>
                                    {!selectedCategory && <ChevronRight className="h-4 w-4" />}
                                </button>
                                {categories.map(category => (
                                    <button key={category.id} onClick={() => handleCategoryClick(category.id)} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", selectedCategory === String(category.id) ? "bg-primary/10 text-primary font-medium" : "text-gray-600 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted")}>
                                        <span>{category.nombre_categoria}</span>
                                        {selectedCategory === String(category.id) && <ChevronRight className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-foreground">{pagination?.total ?? 0} Resultados</h2>
                            <div className="relative hidden lg:block w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Buscar producto..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="block w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                            </div>
                        </div>
                        <div className="min-h-100">
                            {isLoading && products.length === 0 ? (
                                <div className="text-center py-20">Cargando...</div>
                            ) : error ? (
                                <div className="rounded-md bg-red-50 p-4 text-center text-red-700 border border-red-200">{error}</div>
                            ) : (
                                <>
                                    {products.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {products.map(product => (
                                                <ProductCard key={product.id} product={product} isTableMenu={false} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-card rounded-lg border border-border border-dashed">
                                            <XCircle className="mx-auto h-12 w-12 text-gray-300" />
                                            <h3 className="mt-2 text-sm font-semibold text-foreground">No hay productos</h3>
                                        </div>
                                    )}

                                    {pagination && pagination.totalPages > 1 && (
                                        <div className="mt-10 border-t border-border pt-6 flex justify-center">
                                            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
