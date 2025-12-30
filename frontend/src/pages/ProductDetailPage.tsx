/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ProductDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getProductById } from '@/api/productsApi';
import { getResenasForProduct, createResena } from '@/api/resenaApi';
import type { Product } from '@/api/productsApi';
import type { GetResenasResponse } from '@/api/resenaApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { StarRating } from '@/components/public/StarRating';
import { ShoppingCart, User as UserIcon } from 'lucide-react';

// --- Sub-component: ReviewList ---
const ReviewList = ({ reviewsData }: { reviewsData: GetResenasResponse }) => (
    <div className="space-y-6">
        {reviewsData.resenas.map(resena => (
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
const ReviewForm = ({ productId, onReviewSubmitted }: { productId: number; onReviewSubmitted: () => void; }) => {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Por favor, selecciona una calificación.');
            return;
        }
        setIsLoading(true);
        try {
            await createResena(productId, { rating, comment });
            toast.success('Reseña enviada con éxito!');
            setRating(0);
            setComment('');
            onReviewSubmitted();
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar la reseña.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <p className="text-sm text-muted-foreground mt-8">Debes <Link to="/login" className="text-primary underline">iniciar sesión</Link> para dejar una reseña.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <h4 className="text-lg font-semibold mb-3 text-foreground">Deja tu reseña</h4>
            <div className="mb-4">
                <StarRating rating={rating} onRatingChange={setRating} editable={true} size={24} />
            </div>
            <div className="mb-4">
                <textarea
                    id="comment"
                    className="w-full p-2 border border-input rounded-md bg-transparent text-foreground"
                    placeholder="Escribe tu comentario (opcional)..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Reseña'}
            </button>
        </form>
    );
};


// --- Main Component: ProductDetailPage ---
const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);

    const { addItem, isLoading: isAddingToCart } = useCart(); // Use useCart hook
    const [quantity, setQuantity] = useState(1);

    const [product, setProduct] = useState<Product | null>(null);
    const [reviewsData, setReviewsData] = useState<GetResenasResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshReviews, setRefreshReviews] = useState(false);

    useEffect(() => {
        if (isNaN(productId)) {
            setError("ID de producto inválido.");
            setIsLoading(false);
            return;
        }
        
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [fetchedProduct, fetchedReviews] = await Promise.all([
                    getProductById(productId),
                    getResenasForProduct(productId)
                ]);
                setProduct(fetchedProduct);
                setReviewsData(fetchedReviews);
            } catch (err: any) {
                const msg = err.message || 'Error al cargar los datos del producto.';
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAllData();
    }, [productId, refreshReviews]);

    const handleAddToCart = async () => {
        if (!product || quantity <= 0) return;
        try {
            await addItem(product.id, quantity);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Error handling is done inside useCart hook
        }
    };

    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;
    if (error) return <div className="text-center py-12 text-destructive">{error}</div>;
    if (!product) return <div className="text-center py-12 text-muted-foreground">Producto no encontrado.</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Column */}
                <div>
                    <img src={product.imageUrl || 'https://via.placeholder.com/600x600'} alt={product.nombre_producto} className="w-full h-auto object-cover rounded-lg shadow-lg border border-border" />
                </div>

                {/* Details Column */}
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-primary uppercase">{product.categoria?.nombre_categoria}</p>
                    <h1 className="text-3xl lg:text-4xl font-bold mt-1 text-foreground">{product.nombre_producto}</h1>
                    <div className="mt-4 flex items-center gap-4">
                        <StarRating rating={reviewsData?.averageRating || 0} size={20} />
                        <span className="text-muted-foreground text-sm">({reviewsData?.totalResenas || 0} reseñas)</span>
                    </div>
                    <p className="text-3xl font-extrabold text-foreground mt-4">S/ {Number(product.precio_venta).toFixed(2)}</p>
                    
                    <div className="mt-4">
                        {product.stock > 0 ? (
                            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                En Stock ({product.stock} disponibles)
                            </span>
                        ) : (
                            <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">
                                Agotado
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground mt-4 leading-relaxed">{product.descripcion}</p>

                    {product.componentes && product.componentes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Ingredientes:</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.componentes.map(comp => (
                                    <span key={comp.id} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full">{comp.nombre_componente}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-8 flex items-center gap-4">
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-20 p-2 border border-input rounded-md bg-background text-foreground text-center"
                        />
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md text-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                            disabled={product.stock <= 0 || isAddingToCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {product.stock <= 0 ? 'Agotado' : (isAddingToCart ? 'Añadiendo...' : 'Añadir al Carrito')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Reseñas de Clientes</h2>
                {reviewsData && reviewsData.totalResenas > 0 
                    ? <ReviewList reviewsData={reviewsData} />
                    : <p className="text-muted-foreground">Aún no hay reseñas para este producto.</p>
                }
                <ReviewForm productId={productId} onReviewSubmitted={() => setRefreshReviews(p => !p)} />
            </div>
        </div>
    );
};

export default ProductDetailPage;
