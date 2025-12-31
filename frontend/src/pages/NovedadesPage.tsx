// src/pages/NovedadesPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicNovedades } from '@/api/novedadesApi';
import type { Novedad } from '@/api/novedadesApi';
import { toast } from 'sonner';

const NovedadesPage = () => {
    const [novedades, setNovedades] = useState<Novedad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNovedades = async () => {
            setIsLoading(true);
            try {
                const data = await getPublicNovedades();
                setNovedades(data);
            } catch (err: any) {
                const msg = err.message || 'Error al cargar las novedades.';
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNovedades();
    }, []);

    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;
    if (error) return <div className="text-center py-12 text-destructive">{error}</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl lg:text-4xl font-bold mt-1 mb-8 text-foreground">Novedades</h1>
            <div className="grid gap-8">
                {novedades.length > 0 ? (
                    novedades.map(novedad => (
                        <Link key={novedad.id} to={`/novedades/${novedad.id}`} className="block p-6 bg-card rounded-lg border border-border transition-all duration-300 hover:shadow-md hover:border-primary/50">
                            <h2 className="text-2xl font-bold text-foreground">{novedad.title}</h2>
                            <p className="text-muted-foreground mt-2">{new Date(novedad.createdAt).toLocaleDateString()}</p>
                            {novedad.imageUrl && (
                                <img src={novedad.imageUrl} alt={novedad.title} className="my-4 rounded-lg max-h-60 w-full object-cover" />
                            )}
                            <div className="text-muted-foreground mt-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: novedad.content.substring(0, 300) + '...' }} />
                            <span className="text-primary mt-4 inline-block">Leer más</span>
                        </Link>
                    ))
                ) : (
                    <p>No hay novedades publicadas.</p>
                )}
            </div>
        </div>
    );
};

export default NovedadesPage;
