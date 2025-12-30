// src/pages/admin/reviews/ReviewManagementPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, updateReviewStatus, type Review, type ReviewStatus } from '@/api/reviewApi';
import { toast } from 'sonner';
import { Loader2, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReviewManagementPage = () => {
    const [statusFilter, setStatusFilter] = useState<ReviewStatus>('PENDING');
    const queryClient = useQueryClient();

    const { data: reviews = [], isLoading, isError, error } = useQuery({
        queryKey: ['adminReviews', statusFilter],
        queryFn: () => getReviews(statusFilter),
    });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: ReviewStatus }) => updateReviewStatus(id, status),
        onSuccess: (data) => {
            toast.success(`Review ${data.id} has been ${data.status.toLowerCase()}.`);
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update review status.');
        }
    });

    const handleUpdateStatus = (id: number, status: ReviewStatus) => {
        mutation.mutate({ id, status });
    };
    
    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Reseñas</h2>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2 mb-4 border-b pb-4">
                {(['PENDING', 'APPROVED', 'REJECTED'] as ReviewStatus[]).map(status => (
                    <Button 
                        key={status} 
                        variant={statusFilter === status ? 'default' : 'outline'}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Button>
                ))}
            </div>

            {isLoading && <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {isError && <div className="text-red-500">Error: {(error as Error).message}</div>}

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <div className="font-bold text-gray-800">{review.user.name} <span className="text-gray-500 font-normal">on</span> {review.producto.nombre_producto}</div>
                            <div className="flex items-center my-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                        </div>
                        {review.status === 'PENDING' && (
                            <div className="flex space-x-2 flex-shrink-0 ml-4">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(review.id, 'APPROVED')}>
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(review.id, 'REJECTED')}>
                                    <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                            </div>
                        )}
                         {review.status === 'APPROVED' && (
                            <div className="flex items-center text-green-600 font-bold text-sm"><Check className="h-4 w-4 mr-1" /> Approved</div>
                         )}
                         {review.status === 'REJECTED' && (
                             <div className="flex items-center text-red-600 font-bold text-sm"><X className="h-4 w-4 mr-1" /> Rejected</div>
                         )}
                    </div>
                ))}
                {!isLoading && reviews.length === 0 && <p className="text-center text-gray-500 py-10">No reviews found with status '{statusFilter}'.</p>}
            </div>
        </div>
    );
};

export default ReviewManagementPage;
