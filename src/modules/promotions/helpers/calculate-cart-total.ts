import type { CartItemForEngine } from '../types';

export const calculateCartTotal = (cartItems: CartItemForEngine[]): number =>
    cartItems.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
