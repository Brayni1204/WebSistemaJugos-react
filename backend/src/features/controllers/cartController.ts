// src/features/controllers/cartController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';

// Helper function to get or create a cart for the user
const getOrCreateCart = async (userId: number, tenantId: number) => {
    let cart = await prisma.cart.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
        include: { items: { include: { producto: true } } },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId, tenantId },
            include: { items: { include: { producto: true } } },
        });
    }
    return cart;
};

// Get the user's cart
export const getCart = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
            include: { items: { include: { producto: { include: { categoria: true } } } } }, // Include product details
        });

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'An error occurred while fetching the cart.' });
    }
};

// Add item to cart or update quantity if it exists
export const addItemToCart = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { productoId, quantity } = req.body;
    if (!productoId || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Product ID and a valid quantity are required.' });
    }

    try {
        const cart = await getOrCreateCart(userId, tenantId);

        // Check if product exists and belongs to tenant
        const producto = await prisma.producto.findFirst({
            where: { AND: [{ id: productoId }, { tenantId }] },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: { cartId_productoId: { cartId: cart.id, productoId } },
        });

        let cartItem;
        if (existingItem) {
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productoId,
                    quantity,
                },
            });
        }

        res.status(200).json(cartItem);
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'An error occurred while adding the item to the cart.' });
    }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (isNaN(Number(itemId)) || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: { AND: [{ id: Number(itemId) }, { cartId: cart.id }] },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: Number(itemId) },
            data: { quantity },
        });

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ error: 'An error occurred while updating the item quantity.' });
    }
};

// Remove item from cart
export const removeItemFromCart = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { itemId } = req.params;
    if (isNaN(Number(itemId))) {
        return res.status(400).json({ error: 'Item ID must be a number.' });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: { AND: [{ id: Number(itemId) }, { cartId: cart.id }] },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }

        await prisma.cartItem.delete({
            where: { id: Number(itemId) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
    }
};

// Clear the entire cart
export const clearCart = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });

        if (!cart) {
            return res.status(204).send(); // No cart to clear
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'An error occurred while clearing the cart.' });
    }
};
