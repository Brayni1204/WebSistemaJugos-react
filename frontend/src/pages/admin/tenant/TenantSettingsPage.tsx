// src/pages/admin/tenant/TenantSettingsPage.tsx
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantSettings, updateTenantSettings, updateTenantImages, type Tenant } from '@/api/tenantApi';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/tenant/ImageUpload';
import { Loader2 } from 'lucide-react';

const TenantSettingsPage = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<Tenant>();
    
    const [tenantData, setTenantData] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const settings = await getTenantSettings();
                setTenantData(settings);
                reset(settings); 
            } catch (error: any) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [reset]);

    const textSettingsMutation = useMutation({
        mutationFn: (data: Tenant) => {
            const payload = { ...data, delivery_cost: Number(data.delivery_cost) };
            return updateTenantSettings(payload);
        },
        onSuccess: (updatedTenant) => {
            toast.success("Settings updated successfully!");
            reset(updatedTenant);
            setTenantData(updatedTenant);
            queryClient.invalidateQueries({ queryKey: ['tenantSettings'] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to save settings."),
    });

    const imageSettingsMutation = useMutation({
        mutationFn: (formData: FormData) => updateTenantImages(formData),
        onSuccess: (updatedTenant) => {
            toast.success("Images updated successfully!");
            setLogoFile(null);
            setFaviconFile(null);
            setTenantData(updatedTenant);
            reset(updatedTenant);
            queryClient.invalidateQueries({ queryKey: ['tenantSettings'] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to upload images."),
    });

    const onTextSubmit = (data: Tenant) => {
        textSettingsMutation.mutate(data);
    };

    const handleImageSubmit = () => {
        const formData = new FormData();
        if (logoFile) formData.append('logo', logoFile);
        if (faviconFile) formData.append('favicon', faviconFile);
        
        if (logoFile || faviconFile) {
            imageSettingsMutation.mutate(formData);
        } else {
            toast.info("Please select a file to upload.");
        }
    };
    
    const formSectionStyle = "bg-white p-6 border border-gray-200 rounded-lg shadow-sm";
    const formLabelStyle = "block text-sm font-medium text-gray-700";
    const formInputStyle = "block w-full border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm";

    if (isLoading) {
        return <p>Loading settings...</p>;
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit(onTextSubmit)} className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Configuración de la Tienda</h2>
                    <button type="submit" disabled={textSettingsMutation.isPending || !isDirty} className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors">
                        {textSettingsMutation.isPending ? 'Guardando...' : 'Guardar Cambios de Texto'}
                    </button>
                </div>

                {/* General Section */}
                <div className={formSectionStyle}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className={formLabelStyle}>Nombre de la Tienda</label>
                            <input id="name" {...register("name", { required: "This field is required" })} className={formInputStyle} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="subdomain" className={formLabelStyle}>Subdominio (No se puede cambiar)</label>
                            <input id="subdomain" {...register("subdomain")} disabled className={`${formInputStyle} bg-gray-100 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label htmlFor="business_email" className={formLabelStyle}>Email de Contacto</label>
                            <input id="business_email" type="email" {...register("business_email")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="contact_phone" className={formLabelStyle}>Teléfono de Contacto</label>
                            <input id="contact_phone" {...register("contact_phone")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="address" className={formLabelStyle}>Dirección</label>
                            <input id="address" {...register("address")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="delivery_cost" className={formLabelStyle}>Costo de Delivery</label>
                            <input id="delivery_cost" type="number" step="0.01" {...register("delivery_cost")} className={formInputStyle} />
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className={formSectionStyle}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Apariencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="theme_color" className={formLabelStyle}>Color Primario</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Controller name="theme_color" control={control} render={({ field }) => <input type="color" {...field} value={field.value || ''} className="h-10 w-10 p-1 border border-gray-300 rounded-md"/>} />
                                <input {...register("theme_color")} className={`${formInputStyle} w-auto`} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="theme_secondary_color" className={formLabelStyle}>Color Secundario</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Controller name="theme_secondary_color" control={control} render={({ field }) => <input type="color" {...field} value={field.value || ''} className="h-10 w-10 p-1 border border-gray-300 rounded-md"/>} />
                                <input {...register("theme_secondary_color")} className={`${formInputStyle} w-auto`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <input id="dark_mode_enabled" type="checkbox" {...register("dark_mode_enabled")} className="h-4 w-4 text-gray-800 focus:ring-gray-700 border-gray-300 rounded" />
                            <label htmlFor="dark_mode_enabled" className="text-sm font-medium text-gray-700">Habilitar Modo Oscuro para Clientes</label>
                        </div>
                    </div>
                </div>
            
                {/* Content Section */}
                <div className={formSectionStyle}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Contenido de la Página</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="description" className={formLabelStyle}>Descripción Corta (Homepage)</label>
                            <textarea id="description" {...register("description")} rows={2} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="about_us" className={formLabelStyle}>Sobre Nosotros</label>
                            <textarea id="about_us" {...register("about_us")} rows={4} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="mision" className={formLabelStyle}>Misión</label>
                            <textarea id="mision" {...register("mision")} rows={3} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="vision" className={formLabelStyle}>Visión</label>
                            <textarea id="vision" {...register("vision")} rows={3} className={formInputStyle} />
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className={formSectionStyle}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Redes Sociales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="social_links.facebook" className={formLabelStyle}>Facebook URL</label>
                            <input id="social_links.facebook" {...register("social_links.facebook")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="social_links.instagram" className={formLabelStyle}>Instagram URL</label>
                            <input id="social_links.instagram" {...register("social_links.instagram")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="social_links.tiktok" className={formLabelStyle}>TikTok URL</label>
                            <input id="social_links.tiktok" {...register("social_links.tiktok")} className={formInputStyle} />
                        </div>
                        <div>
                            <label htmlFor="social_links.whatsapp" className={formLabelStyle}>Whatsapp URL</label>
                            <input id="social_links.whatsapp" {...register("social_links.whatsapp")} className={formInputStyle} placeholder="Ej: https://wa.me/51987654321"/>
                        </div>
                    </div>
                </div>
            </form>

            {/* Image upload section */}
            <div className={formSectionStyle}>
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Logo y Favicon</h3>
                    <button onClick={handleImageSubmit} disabled={imageSettingsMutation.isPending || (!logoFile && !faviconFile)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {imageSettingsMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Guardar Imágenes'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload 
                        label="Logo Principal (para header y footer)"
                        currentImageUrl={tenantData?.logo_url}
                        onFileSelect={setLogoFile}
                        aspectRatio="16 / 9"
                    />
                    <ImageUpload 
                        label="Favicon (icono del navegador)"
                        currentImageUrl={tenantData?.favicon_url}
                        onFileSelect={setFaviconFile}
                        aspectRatio="1 / 1"
                    />
                </div>
            </div>
        </div>
    );
};

export default TenantSettingsPage;
