// src/pages/admin/compras/GastoCreatePage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { getProveedores, type Proveedor } from '@/api/proveedorApi';
import { getPublicProducts, type Product } from '@/api/productsApi';
import { createGasto } from '@/api/gastoApi';
import { Trash2 } from 'lucide-react';

type LineItem = {
    type: 'PRODUCT' | 'GENERIC';
    productoId?: number;
    description: string;
    quantity: number;
    purchase_price: number;
};

type FormValues = {
    proveedorId: number | '';
    date: string;
    items: LineItem[];
};

const GastoCreatePage = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { register, control, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            proveedorId: '',
            date: new Date().toISOString().split('T')[0],
            items: []
        }
    });
    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = watch("items");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [provData, prodData] = await Promise.all([
                    getProveedores(),
                    getPublicProducts({ limit: 1000 })
                ]);
                setProveedores(provData);
                setProducts(prodData.data.filter(p => p.tracks_stock));
            } catch (error: any) {
                toast.error(error.message || "Failed to load initial data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const total = useMemo(() => {
        return watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchase_price) || 0), 0);
    }, [watchedItems]);

    const onSubmit = async (data: FormValues) => {
        if (data.items.length === 0) {
            toast.error("Please add at least one item.");
            return;
        }

        try {
            await createGasto({
                proveedorId: data.proveedorId ? Number(data.proveedorId) : null,
                date: data.date,
                items: data.items.map(item => ({
                    productoId: item.type === 'PRODUCT' ? Number(item.productoId) : undefined,
                    description: item.type === 'GENERIC' ? item.description : '',
                    quantity: Number(item.quantity),
                    purchase_price: Number(item.purchase_price)
                }))
            });
            toast.success("Purchase created successfully!");
            navigate('/admin/gastos');
        } catch (error: any) {
            toast.error(error.message || "Failed to create expense.");
        }
    };
    
    const addLineItem = (type: 'PRODUCT' | 'GENERIC') => {
        append({
            type: type,
            productoId: type === 'PRODUCT' ? (products[0]?.id || 0) : undefined,
            description: '',
            quantity: 1,
            purchase_price: 0
        });
    };

    if (isLoading) return <p>Loading data...</p>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Registrar Nueva Compra / Gasto</h2>
                <Link to="/admin/compras" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">&larr; Volver</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="proveedorId" className="block text-sm font-medium text-gray-700">Proveedor (Opcional)</label>
                    <select id="proveedorId" {...register("proveedorId")} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm">
                        <option value="">Sin proveedor</option>
                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input id="date" type="date" {...register("date", { required: true })} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 items-center gap-2 p-2 bg-gray-50 rounded-md">
                            <Controller
                                name={`items.${index}.type`}
                                control={control}
                                render={({ field }) => (
                                    <select {...field} className="col-span-3 border-gray-300 rounded-lg shadow-sm">
                                        <option value="PRODUCT">Producto</option>
                                        <option value="GENERIC">Gasto Genérico</option>
                                    </select>
                                )}
                            />
                            
                            {watch(`items.${index}.type`) === 'PRODUCT' ? (
                                <Controller
                                    name={`items.${index}.productoId`}
                                    control={control}
                                    render={({ field }) => (
                                        <select {...field} className="col-span-4 border-gray-300 rounded-lg shadow-sm">
                                            {products.map(p => <option key={p.id} value={p.id}>{p.nombre_producto}</option>)}
                                        </select>
                                    )}
                                />
                            ) : (
                                <input {...register(`items.${index}.description`)} placeholder="Descripción del gasto" className="col-span-4 border-gray-300 rounded-lg shadow-sm" />
                            )}
                            
                            <input {...register(`items.${index}.quantity`)} type="number" min="1" placeholder="Cantidad" className="col-span-2 border-gray-300 rounded-lg shadow-sm" />
                            <input {...register(`items.${index}.purchase_price`)} type="number" step="0.01" min="0" placeholder="Precio" className="col-span-2 border-gray-300 rounded-lg shadow-sm" />
                            <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                        </div>
                    ))}
                </div>
                <div className="mt-3 space-x-2">
                    <button type="button" onClick={() => addLineItem('PRODUCT')} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">+ Añadir Producto</button>
                    <button type="button" onClick={() => addLineItem('GENERIC')} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">+ Añadir Gasto</button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-6">
                <div>
                    <span className="text-lg font-bold text-gray-700">Total: </span>
                    <span className="text-2xl font-bold text-gray-900">S/ {total.toFixed(2)}</span>
                </div>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Compra/Gasto'}
                </button>
            </div>
        </form>
    );
};

export default GastoCreatePage;