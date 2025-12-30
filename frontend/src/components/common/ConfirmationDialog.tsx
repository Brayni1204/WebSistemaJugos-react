// src/components/common/ConfirmationDialog.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react'; // Use lucide-react icon

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description,
    confirmButtonText = "Confirmar",
    cancelButtonText = "Cancelar"
}: ConfirmationDialogProps) => {

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black bg-opacity-50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
                <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none w-[90vw] max-w-md z-50">
                    <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </Dialog.Description>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                {cancelButtonText}
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            {confirmButtonText}
                        </button>
                    </div>
                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};


export default ConfirmationDialog;
