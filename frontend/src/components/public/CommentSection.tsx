// src/components/public/CommentSection.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommentsForPage, createComment } from '@/api/pageCommentApi';
import type { PageComment, CreateCommentPayload } from '@/api/pageCommentApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CommentSectionProps {
    pageType: string;
    pageId: number;
}

const Comment = ({ comment, onReply }: { comment: PageComment, onReply: (commentId: number) => void }) => (
    <div className="flex gap-4">
        <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center">
            {/* You can add user avatar here */}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-foreground">{comment.user.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
            <div className="mt-2 text-xs text-muted-foreground">
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                <button onClick={() => onReply(comment.id)} className="ml-4 font-semibold hover:text-primary">Responder</button>
            </div>
            <div className="ml-8 mt-4 space-y-4">
                {comment.children && comment.children.map(child => <Comment key={child.id} comment={child} onReply={onReply} />)}
            </div>
        </div>
    </div>
);

const CommentForm = ({ pageType, pageId, parentId, onCommentSubmitted }: { pageType: string, pageId: number, parentId: number | null, onCommentSubmitted: () => void }) => {
    const { isAuthenticated } = useAuth();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error('El comentario no puede estar vacío.');
            return;
        }
        setIsLoading(true);
        try {
            const payload: CreateCommentPayload = { content };
            if (parentId) {
                payload.parentId = parentId;
            }
            await createComment(pageType, pageId, payload);
            toast.success('Comentario enviado con éxito!');
            setContent('');
            onCommentSubmitted();
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar el comentario.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <p className="text-sm text-muted-foreground mt-8">Debes <Link to="/login" className="text-primary underline">iniciar sesión</Link> para dejar un comentario.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6">
            <textarea
                className="w-full p-2 border border-input rounded-md bg-transparent text-foreground"
                placeholder="Escribe tu comentario..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <button type="submit" className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Comentario'}
            </button>
        </form>
    );
};

const CommentSection = ({ pageType, pageId }: CommentSectionProps) => {
    const [comments, setComments] = useState<PageComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const data = await getCommentsForPage(pageType, pageId);
                setComments(data);
            } catch (err: any) {
                setError(err.message || 'Error al cargar los comentarios.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [pageType, pageId, refresh]);

    const handleCommentSubmitted = () => {
        setRefresh(p => !p);
        setReplyingTo(null);
    };

    if (isLoading) return <div>Cargando comentarios...</div>;
    if (error) return <div className="text-destructive">{error}</div>;

    return (
        <div>
            <CommentForm pageType={pageType} pageId={pageId} parentId={null} onCommentSubmitted={handleCommentSubmitted} />
            <div className="mt-8 space-y-6">
                {comments.map(comment => (
                    <div key={comment.id}>
                        <Comment comment={comment} onReply={setReplyingTo} />
                        {replyingTo === comment.id && (
                            <div className="ml-12 mt-4">
                                <CommentForm pageType={pageType} pageId={pageId} parentId={comment.id} onCommentSubmitted={handleCommentSubmitted} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
