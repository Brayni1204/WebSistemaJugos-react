"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeItemFromCart = exports.updateCartItemQuantity = exports.addItemToCart = exports.getCart = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Helper function to get or create a cart for the user
const getOrCreateCart = (userId, tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    let cart = yield prisma_1.default.cart.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
        include: { items: { include: { producto: true } } },
    });
    if (!cart) {
        cart = yield prisma_1.default.cart.create({
            data: { userId, tenantId },
            include: { items: { include: { producto: true } } },
        });
    }
    return cart;
});
// Get the user's cart
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    try {
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
            include: { items: { include: { producto: { include: { categoria: true } } } } }, // Include product details
        });
        res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'An error occurred while fetching the cart.' });
    }
});
exports.getCart = getCart;
// Add item to cart or update quantity if it exists
const addItemToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { productoId, quantity } = req.body;
    if (!productoId || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Product ID and a valid quantity are required.' });
    }
    try {
        const cart = yield getOrCreateCart(userId, tenantId);
        // Check if product exists and belongs to tenant
        const producto = yield prisma_1.default.producto.findFirst({
            where: { AND: [{ id: productoId }, { tenantId }] },
        });
        if (!producto) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        const existingItem = yield prisma_1.default.cartItem.findUnique({
            where: { cartId_productoId: { cartId: cart.id, productoId } },
        });
        let cartItem;
        if (existingItem) {
            cartItem = yield prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            cartItem = yield prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productoId,
                    quantity,
                },
            });
        }
        res.status(200).json(cartItem);
    }
    catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'An error occurred while adding the item to the cart.' });
    }
});
exports.addItemToCart = addItemToCart;
// Update item quantity in cart
const updateCartItemQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (isNaN(Number(itemId)) || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }
    try {
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }
        const cartItem = yield prisma_1.default.cartItem.findFirst({
            where: { AND: [{ id: Number(itemId) }, { cartId: cart.id }] },
        });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }
        const updatedItem = yield prisma_1.default.cartItem.update({
            where: { id: Number(itemId) },
            data: { quantity },
        });
        res.status(200).json(updatedItem);
    }
    catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ error: 'An error occurred while updating the item quantity.' });
    }
});
exports.updateCartItemQuantity = updateCartItemQuantity;
// Remove item from cart
const removeItemFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { itemId } = req.params;
    if (isNaN(Number(itemId))) {
        return res.status(400).json({ error: 'Item ID must be a number.' });
    }
    try {
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }
        const cartItem = yield prisma_1.default.cartItem.findFirst({
            where: { AND: [{ id: Number(itemId) }, { cartId: cart.id }] },
        });
        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }
        yield prisma_1.default.cartItem.delete({
            where: { id: Number(itemId) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
    }
});
exports.removeItemFromCart = removeItemFromCart;
// Clear the entire cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified.' });
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    try {
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });
        if (!cart) {
            return res.status(204).send(); // No cart to clear
        }
        yield prisma_1.default.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'An error occurred while clearing the cart.' });
    }
});
exports.clearCart = clearCart;
