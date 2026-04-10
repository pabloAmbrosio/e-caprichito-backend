import type { CartPromotionItem } from "../../adapters/promotion.adapter";
import type { Cart } from "../../types/cart.types";

export const mapCartItemsForEngine = (items: Cart["items"]): CartPromotionItem[] =>
    items.map((item) => ({
        productId: item.productId,
        categoryId: item.product.abstractProduct?.categoryId ?? '',
        tags: item.product.abstractProduct?.tags ?? [],
        priceInCents: item.product.priceInCents,
        quantity: item.quantity,
        title: item.product.title,
    }));

export const calculateSubtotalInCents = (items: readonly CartPromotionItem[]): number =>
    items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
