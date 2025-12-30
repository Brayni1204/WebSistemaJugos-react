// src/pages/TableMenuPage.tsx
import { useParams } from 'react-router-dom';
import { TableOrderProvider, useTableOrder } from '@/contexts/TableOrderContext';
import ProductsPage from './ProductsPage'; // We will reuse the existing products page component
import { useEffect } from 'react';
import ViewOrder from '@/components/table-order/ViewOrder';

const TableMenuContent = () => {
    const { table_uuid } = useParams<{ table_uuid: string }>();
    const { setTableUuid } = useTableOrder();

    useEffect(() => {
        if (table_uuid) {
            setTableUuid(table_uuid);
        }
    }, [table_uuid, setTableUuid]);

    return (
        <div className="bg-background min-h-screen">
            <header className="p-4 text-center border-b border-border">
                <h1 className="text-2xl font-bold text-primary">Bienvenido a nuestra mesa</h1>
                <p className="text-muted-foreground">Explora nuestro menú y haz tu pedido.</p>
            </header>
            <ProductsPage isTableMenu={true} /> 
            <ViewOrder />
        </div>
    );
};

const TableMenuPage = () => {
    return (
        <TableOrderProvider>
            <TableMenuContent />
        </TableOrderProvider>
    );
};

export default TableMenuPage;
