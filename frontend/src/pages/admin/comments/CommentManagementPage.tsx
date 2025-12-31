// src/pages/admin/comments/CommentManagementPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { listAllComments, updateCommentStatus, deleteComment } from '@/api/commentManagementApi';
import type { PageComment } from '@/api/commentManagementApi';
import { toast } from 'sonner';

const CommentManagementPage = () => {
    const [comments, setComments] = useState<PageComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshToggle, setRefreshToggle] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await listAllComments();
            setComments(data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch comments.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshToggle]);

    const handleRefresh = () => {
        setRefreshToggle(prev => !prev);
    };

    const handleUpdateStatus = async (id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
        try {
            await updateCommentStatus(id, status);
            toast.success(`Comment status updated to ${status}`);
            handleRefresh();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update comment status.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(id);
                toast.success('Comment deleted successfully!');
                handleRefresh();
            } catch (err: any) {
                toast.error(err.message || 'Failed to delete comment.');
            }
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">Comment Management</h3>
            </div>
            
            <div className="mt-4">
                {isLoading && <p>Loading comments...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {comments.map((comment) => (
                                    <tr key={comment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comment.user.name}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-sm truncate">{comment.content}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.pageType}/{comment.pageId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {comment.status !== 'APPROVED' && <button onClick={() => handleUpdateStatus(comment.id, 'APPROVED')} className="text-green-600 hover:text-green-900">Approve</button>}
                                            {comment.status !== 'REJECTED' && <button onClick={() => handleUpdateStatus(comment.id, 'REJECTED')} className="ml-4 text-yellow-600 hover:text-yellow-900">Reject</button>}
                                            <button onClick={() => handleDelete(comment.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentManagementPage;
