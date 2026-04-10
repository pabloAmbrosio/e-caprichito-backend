import type { CartItemForEngine } from '../types';

export const mapCartItemsForEngine = (
    items: Array<{
        productId: string;
        quantity: number;
        product: {
            priceInCents: number;
            title: string;
            abstractProduct: { categoryId: string | null; tags: string[] } | null;
        };
    }>
): CartItemForEngine[] =>
    items.map((item) => ({
        productId: item.productId,
        categoryId: item.product.abstractProduct?.categoryId ?? '',
        tags: item.product.abstractProduct?.tags ?? [],
        priceInCents: item.product.priceInCents,
        quantity: item.quantity,
        title: item.product.title,
    }));
