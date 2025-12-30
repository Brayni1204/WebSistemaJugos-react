// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getProfile, updateProfile, getMyOrders, type ProfileData, type Pedido, type OrderItem } from '@/api/profileApi';
import { toast } from 'sonner';

// These will be sub-components for the tabs
const ProfileDetailsTab = () => {
    const { user, logout } = useAuth(); // We might need to refresh user data in context after update
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const profileData = await getProfile();
                setProfile(profileData);
                setName(profileData.name || '');
                setApellidos(profileData.cliente?.apellidos || '');
                setTelefono(profileData.cliente?.telefono || '');
            } catch (error) {
                toast.error("Error al cargar el perfil.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ name, apellidos, telefono });
            toast.success("Perfil actualizado exitosamente.");
            // Optionally, refresh user data in auth context here
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el perfil.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <p className="text-muted-foreground">Cargando perfil...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Detalles del Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Nombre</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full input-style"
                    />
                </div>
                 <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-muted-foreground">Apellidos</label>
                    <input
                        type="text"
                        id="apellidos"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        className="mt-1 block w-full input-style"
                    />
                </div>
                 <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-muted-foreground">Teléfono</label>
                    <input
                        type="text"
                        id="telefono"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="mt-1 block w-full input-style"
                    />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        readOnly
                        className="mt-1 block w-full input-style bg-muted/50 cursor-not-allowed"
                    />
                </div>
                <div className="pt-2">
                     <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const OrderHistoryTab = () => {
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const orderData = await getMyOrders();
                setOrders(orderData);
            } catch (error) {
                toast.error("Error al cargar el historial de pedidos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (isLoading) return <p className="text-muted-foreground">Cargando pedidos...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Historial de Pedidos</h2>
            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold">Pedido #{order.id}</p>
                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Total: <span className="font-bold">S/ {Number(order.total_pago).toFixed(2)}</span></p>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize`}>
                                    {order.estado}
                                </span>
                            </div>
                            <div className="mt-4 border-t border-border pt-2">
                                <p className="text-sm font-medium text-muted-foreground">Items:</p>
                                <ul className="list-disc list-inside text-sm">
                                    {order.detalle_pedidos.map((item: OrderItem) => (
                                        <li key={item.id}>{item.cantidad} x {item.nombre_producto}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No tienes pedidos anteriores.</p>
            )}
        </div>
    );
}

type Tab = 'profile' | 'orders';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const { user, logout } = useAuth();

    if (!user) {
        return <div className="text-center py-12 text-muted-foreground">Cargando perfil...</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Mi Cuenta</h1>
                <p className="text-muted-foreground">Hola, {user.name}. Aquí puedes gestionar tu perfil y ver tus pedidos.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Navigation */}
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={cn(
                                "w-full text-left px-4 py-2 rounded-md transition-colors font-medium",
                                activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            Mi Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={cn(
                                "w-full text-left px-4 py-2 rounded-md transition-colors font-medium",
                                activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            Mis Pedidos
                        </button>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 rounded-md transition-colors font-medium text-destructive hover:bg-destructive/10"
                        >
                            Cerrar Sesión
                        </button>
                    </nav>
                </aside>

                {/* Tab Content */}
                <main className="w-full md:w-3/4 lg:w-4/5 bg-card p-6 rounded-lg border border-border">
                    {activeTab === 'profile' && <ProfileDetailsTab />}
                    {activeTab === 'orders' && <OrderHistoryTab />}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
