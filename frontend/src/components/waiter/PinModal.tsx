import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Lock } from 'lucide-react';

interface PinModalProps {
    onSubmit: (pin: string) => void;
    isLoading: boolean;
    onClose: () => void;
}

const PinModal = ({ onSubmit, isLoading, onClose }: PinModalProps) => {
    const [pin, setPin] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length >= 4) onSubmit(pin);
        else toast.error('PIN demasiado corto');
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                {/* Overlay claro con desenfoque */}
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" />

                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-95 focus:outline-none animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                        {/* Decoración sutil superior */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                <Lock className="text-indigo-600 w-8 h-8" />
                            </div>

                            <Dialog.Title className="text-2xl font-black text-slate-800 tracking-tight">
                                Acceso Mozo
                            </Dialog.Title>
                            <Dialog.Description className="text-slate-400 text-sm font-medium mt-1 mb-8">
                                Ingresa tu PIN de seguridad
                            </Dialog.Description>

                            <form onSubmit={handleSubmit} className="w-full space-y-6">
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="w-full h-16 text-center text-3xl font-black tracking-[1em] border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 transition-all bg-slate-50 group-hover:bg-white text-indigo-600"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
                                </Button>
                            </form>
                        </div>

                        <Dialog.Close asChild>
                            <button
                                className="absolute top-6 right-6 p-2 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                                onClick={onClose}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default PinModal;