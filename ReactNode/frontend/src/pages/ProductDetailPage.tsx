/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ProductDetailPage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPublicProductById } from '@/api/productsApi';
import { getResenasForProduct, createResena } from '@/api/resenaApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { StarRating } from '@/components/public/StarRating';
import { ShoppingCart, User as UserIcon, Loader2 } from 'lucide-react';

// --- Sub-component: ReviewList ---
const ReviewList = ({ reviewsData }: { reviewsData: any }) => (
    <div className="space-y-6">
        {reviewsData.resenas.map((resena: any) => (
            <div key={resena.id} className="flex gap-4">
                <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{resena.user?.name || 'Usuario Anónimo'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(resena.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StarRating rating={resena.rating} size={16} />
                    <p className="text-sm text-muted-foreground mt-2">{resena.comment}</p>
                </div>
            </div>
        ))}
    </div>
);

// --- Sub-component: ReviewForm ---
const ReviewForm = ({ productId, onReviewSubmitted, userHasReviewed }: { productId: number; onReviewSubmitted: () => void; userHasReviewed: boolean; }) => {
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const mutation = useMutation({
        mutationFn: (payload: { rating: number; comment?: string }) => createResena(productId, payload),
        onSuccess: () => {
            toast.success('Reseña enviada para aprobación.');
            setRating(0);
            setComment('');
            onReviewSubmitted();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al enviar la reseña.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Por favor, selecciona una calificación.');
        mutation.mutate({ rating, comment });
    };

    if (!isAuthenticated) {
        return <p className="text-sm text-muted-foreground mt-8">Debes <Link to="/login" className="text-primary underline">iniciar sesión</Link> para dejar una reseña.</p>;
    }
    
    if (userHasReviewed) {
        return <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md mt-8">Gracias, ya has enviado una reseña para este producto.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <h4 className="text-lg font-semibold mb-3 text-foreground">Deja tu reseña</h4>
            <div className="mb-4"><StarRating rating={rating} onRatingChange={setRating} editable={true} size={24} /></div>
            <div className="mb-4">
                <textarea id="comment" className="w-full p-2 border border-input rounded-md bg-transparent text-foreground" placeholder="Escribe tu comentario (opcional)..." rows={4} value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50" disabled={mutation.isPending}>
                {mutation.isPending ? 'Enviando...' : 'Enviar Reseña'}
            </button>
        </form>
    );
};


// --- Main Component: ProductDetailPage ---
const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { addItem, isLoading: isAddingToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const { data: product, isLoading: isProductLoading, error: productError } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getPublicProductById(productId),
        enabled: !isNaN(productId),
    });

    const { data: reviewsData, isLoading: areReviewsLoading } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => getResenasForProduct(productId),
        enabled: !isNaN(productId),
    });
    
    const userHasReviewed = reviewsData?.resenas.some(r => r.user.id === user?.id) || false;

    const handleAddToCart = async () => {
        if (!product || quantity <= 0) return;
        await addItem(product.id, quantity);
    };

    if (isProductLoading || areReviewsLoading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;
    if (productError) return <div className="text-center py-12 text-destructive">{(productError as Error).message}</div>;
    if (!product) return <div className="text-center py-12 text-muted-foreground">Producto no encontrado.</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Column */}
                <div><img src={product.imageUrl || 'https://via.placeholder.com/600x600'} alt={product.nombre_producto} className="w-full h-auto object-cover rounded-lg shadow-lg border border-border" /></div>

                {/* Details Column */}
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-primary uppercase">{product.categoria?.nombre_categoria}</p>
                    <h1 className="text-3xl lg:text-4xl font-bold mt-1 text-foreground">{product.nombre_producto}</h1>
                    <div className="mt-4 flex items-center gap-4">
                        <StarRating rating={reviewsData?.averageRating || 0} size={20} />
                        <span className="text-muted-foreground text-sm">({reviewsData?.totalResenas || 0} reseñas)</span>
                    </div>
                    <p className="text-3xl font-extrabold text-foreground mt-4">S/ {Number(product.precio_venta).toFixed(2)}</p>
                    
                    <div className="mt-4">{product.stock > 0 ? <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">En Stock ({product.stock} disponibles)</span> : <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">Agotado</span>}</div>

                    <p className="text-muted-foreground mt-4 leading-relaxed">{product.descripcion}</p>

                    {product.componentes && product.componentes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Ingredientes:</h3>
                            <div className="flex flex-wrap gap-2">{product.componentes.map(comp => (<span key={comp.id} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full">{comp.nombre_componente}</span>))}</div>
                        </div>
                    )}
                    
                    <div className="mt-8 flex items-center gap-4">
                        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-20 p-2 border border-input rounded-md bg-background text-foreground text-center" />
                        <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md text-lg font-semibold hover:bg-primary/90 disabled:opacity-50" disabled={product.stock <= 0 || isAddingToCart}>
                            <ShoppingCart className="h-5 w-5" />
                            {product.stock <= 0 ? 'Agotado' : (isAddingToCart ? 'Añadiendo...' : 'Añadir al Carrito')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Reseñas de Clientes</h2>
                {reviewsData && reviewsData.totalResenas > 0 ? <ReviewList reviewsData={reviewsData} /> : <p className="text-muted-foreground">Aún no hay reseñas para este producto.</p>}
                <ReviewForm productId={productId} onReviewSubmitted={() => queryClient.invalidateQueries({ queryKey: ['reviews', productId] })} userHasReviewed={userHasReviewed} />
            </div>
        </div>
    );
};

export default ProductDetailPage;
