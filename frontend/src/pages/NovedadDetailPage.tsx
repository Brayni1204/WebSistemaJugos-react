// src/pages/NovedadDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicNovedadById } from '@/api/novedadesApi';
import type { Novedad } from '@/api/novedadesApi';
import { toast } from 'sonner';
import CommentSection from '@/components/public/CommentSection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NovedadDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const novedadId = Number(id);

    const [novedad, setNovedad] = useState<Novedad | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(novedadId)) {
            setError("ID de novedad inválido.");
            setIsLoading(false);
            return;
        }

        const fetchNovedad = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPublicNovedadById(novedadId);
                setNovedad(data);
            } catch (err: any) {
                const msg = err.message || 'Error al cargar la novedad.';
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchNovedad();
    }, [novedadId]);

    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;
    if (error) return <div className="text-center py-12 text-destructive">{error}</div>;
    if (!novedad) return <div className="text-center py-12 text-muted-foreground">Novedad no encontrada.</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <article>
                <h1 className="text-3xl lg:text-4xl font-bold mt-1 text-foreground">{novedad.title}</h1>
                <p className="text-muted-foreground mt-2 mb-6">{new Date(novedad.createdAt).toLocaleDateString()}</p>
                
                {novedad.imageUrl && (
                    <img src={novedad.imageUrl} alt={novedad.title} className="my-4 rounded-lg shadow-lg border border-border" />
                )}

                <div className="prose dark:prose-invert max-w-none mt-8">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{novedad.content}</ReactMarkdown>
                </div>
            </article>

            <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Comentarios</h2>
                <CommentSection pageType="news" pageId={novedadId} />
            </div>
        </div>
    );
};

export default NovedadDetailPage;
