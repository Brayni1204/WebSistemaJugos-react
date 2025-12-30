// src/components/admin/mesas/QrCodeModal.tsx
import { QRCodeSVG } from 'qrcode.react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Mesa } from '@/api/mesaApi';

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    mesa: Mesa | null;
}

const QrCodeModal = ({ isOpen, onClose, mesa }: QrCodeModalProps) => {
    if (!isOpen || !mesa) {
        return null;
    }

    // Construct the URL the QR code will point to
    const clientUrl = `${window.location.protocol}//${window.location.host}`;
    const qrUrl = `${clientUrl}/mesa/${mesa.uuid}`;

    const downloadQR = () => {
        const svgElement = document.getElementById('qrcode-svg');
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const svgSize = svgElement.getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = document.createElement("img");
                img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    const link = document.createElement("a");
                    link.download = `mesa_${mesa.numero_mesa}_qr.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                };
            }
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-gray-900 bg-opacity-75 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
                <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none w-[90vw] max-w-sm z-50">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                        Código QR para la Mesa {mesa.numero_mesa}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-gray-500">
                        Los clientes pueden escanear este código para ver el menú y hacer su pedido desde esta mesa.
                    </Dialog.Description>
                    
                    <div className="my-6 flex items-center justify-center bg-white p-4 rounded-md">
                         <QRCodeSVG 
                            id="qrcode-svg"
                            value={qrUrl}
                            size={256}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={false}
                         />
                    </div>
                   
                    <div className="mt-6 flex justify-end space-x-3">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                Cerrar
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={downloadQR}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 transition-colors"
                        >
                            Descargar PNG
                        </button>
                    </div>

                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close">
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default QrCodeModal;
