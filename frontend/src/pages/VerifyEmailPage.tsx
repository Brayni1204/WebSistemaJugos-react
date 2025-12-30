// src/pages/VerifyEmailPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyUserEmail } from '@/api/authApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // To update auth state after verification

const VerifyEmailPage = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuthData } = useAuth(); // Use the new function from context

    const userEmail = location.state?.email as string; // Email passed from registration

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userEmail) {
            toast.error('Email no encontrado. Por favor, regístrate de nuevo.');
            navigate('/register');
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyUserEmail({ email: userEmail, code });
            toast.success(response.message);
            // After successful verification, directly set the auth state
            setAuthData(response.token, response.user);
            navigate('/'); // Navigate to home page or dashboard
        } catch (error: any) {
            toast.error(error.message || 'Error al verificar el código.');
        } finally {
            setIsLoading(false);
        }
    };

    // TODO: Implement a "Resend Code" button logic

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-foreground">Verifica tu email</h2>
                <p className="text-center text-muted-foreground">
                    Hemos enviado un código de verificación a <span className="font-semibold text-primary">{userEmail || 'tu email'}</span>.
                    Por favor, introdúcelo a continuación.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-muted-foreground">Código de verificación</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground text-center text-xl tracking-wider focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? 'Verificando...' : 'Verificar'}
                    </button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    <button
                        // TODO: Implement resend logic
                        className="font-medium text-primary hover:underline"
                    >
                        Reenviar código
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
