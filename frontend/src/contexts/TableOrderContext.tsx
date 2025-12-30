// src/contexts/TableOrderContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product } from '@/api/productsApi';
import { toast } from 'sonner';

import { getActiveOrdersForTable, type PreviouslyOrderedItem } from '@/api/mesaApi';

// The shape of a single item in our local cart
export interface TableOrderItem extends Product {
    quantity: number;
}

interface TableOrderContextType {
    tableUuid: string | null;
    setTableUuid: (uuid: string) => void;
    items: TableOrderItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    increaseQuantity: (productId: number) => void;
    decreaseQuantity: (productId: number) => void;
    clearOrder: () => void;
    itemsCount: number;
    totalPrice: number;
    previouslyOrderedItems: PreviouslyOrderedItem[];
    isLoadingPreviouslyOrdered: boolean;
    refreshPreviouslyOrdered: () => void;
}

const TableOrderContext = createContext<TableOrderContextType | undefined>(undefined);

// Helper to get sessionStorage safely (for SSR compatibility)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSessionStorage = (key: string, defaultValue: any) => {
    try {
        const storedValue = sessionStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error("Could not read from session storage", error);
        return defaultValue;
    }
}

export const TableOrderProvider = ({ children }: { children: ReactNode }) => {
    const [tableUuid, setTableUuidState] = useState<string | null>(() => getSessionStorage('tableUuid', null));
    const [items, setItems] = useState<TableOrderItem[]>(() => getSessionStorage('tableOrderItems', []));
    
    const [previouslyOrderedItems, setPreviouslyOrderedItems] = useState<PreviouslyOrderedItem[]>([]);
    const [isLoadingPreviouslyOrdered, setIsLoadingPreviouslyOrdered] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        try {
            sessionStorage.setItem('tableUuid', JSON.stringify(tableUuid));
            sessionStorage.setItem('tableOrderItems', JSON.stringify(items));
        } catch (error) {
            console.error("Could not write to session storage", error);
        }
    }, [tableUuid, items]);

    useEffect(() => {
        const fetchPreviousItems = async () => {
            if (!tableUuid) {
                setPreviouslyOrderedItems([]);
                setIsLoadingPreviouslyOrdered(false);
                return;
            }
            setIsLoadingPreviouslyOrdered(true);
            const previousItems = await getActiveOrdersForTable(tableUuid);
            setPreviouslyOrderedItems(previousItems);
            setIsLoadingPreviouslyOrdered(false);
        };

        fetchPreviousItems();
    }, [tableUuid, refreshTrigger]);

    const setTableUuid = (uuid: string) => {
        if (uuid !== tableUuid) {
            setItems([]); // Clear current cart if table changes
        }
        setTableUuidState(uuid);
    };

    const refreshPreviouslyOrdered = () => {
        setRefreshTrigger(p => p + 1);
    };

    const addItem = useCallback((product: Product, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
        toast.success(`'${product.nombre_producto}' añadido al pedido.`);
    }, []);

    const removeItem = (productId: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const increaseQuantity = (productId: number) => {
        setItems(prevItems => prevItems.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const decreaseQuantity = (productId: number) => {
        setItems(prevItems => {
            const item = prevItems.find(p => p.id === productId);
            if (item && item.quantity > 1) {
                return prevItems.map(p => 
                    p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
                );
            }
            // If quantity is 1, remove the item
            return prevItems.filter(p => p.id !== productId);
        });
    };

    const clearOrder = () => {
        setItems([]);
        toast.info('El pedido ha sido limpiado.');
    };

    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * Number(item.precio_venta), 0);

    const value = {
        tableUuid,
        setTableUuid,
        items,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearOrder,
        itemsCount,
        totalPrice,
        previouslyOrderedItems,
        isLoadingPreviouslyOrdered,
        refreshPreviouslyOrdered,
    };

    return (
        <TableOrderContext.Provider value={value}>
            {children}
        </TableOrderContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTableOrder = () => {
    const context = useContext(TableOrderContext);
    if (context === undefined) {
        throw new Error('useTableOrder must be used within a TableOrderProvider');
    }
    return context;
};
