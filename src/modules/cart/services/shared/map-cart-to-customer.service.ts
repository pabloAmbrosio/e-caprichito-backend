import type { CartPromotionResult } from "../../adapters/promotion.adapter";
import type { Cart } from "../../types/cart.types";
import type { ProductImage } from "../../../product/types/product-image.types";

const extractThumbnail = (images: unknown): { thumbnailUrl: string | null; thumbnailAlt: string | null } => {
    if (!Array.isArray(images) || images.length === 0) {
        return { thumbnailUrl: null, thumbnailAlt: null };
    }
    const first = images[0] as ProductImage;
    return {
        thumbnailUrl: first.thumbnailUrl ?? null,
        thumbnailAlt: first.alt ?? null,
    };
};

export const mapCartToCustomerService = (cart: Cart, engineResult: CartPromotionResult | null) => {
    const items = cart.items.map(item => {
        const { thumbnailUrl, thumbnailAlt } = extractThumbnail(item.product.images);

        return {
            id: item.id,
            quantity: item.quantity,
            selectedVariantId: item.productId,
            lineTotal: item.product.priceInCents * item.quantity,
            product: {
                id: item.product.abstractProduct.id,
                title: item.product.abstractProduct.title,
                slug: item.product.abstractProduct.slug,
                priceInCents: item.product.priceInCents,
                compareAtPriceInCents: item.product.compareAtPriceInCents,
                thumbnailUrl,
                thumbnailAlt,
            },
        };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
        items,
        couponCode: cart.couponCode ?? null,
        subtotal,
        appliedPromotions: engineResult?.appliedPromotions ?? [],
        totalDiscount: engineResult?.totalDiscountInCents ?? 0,
        total: engineResult?.finalTotalInCents ?? subtotal,
    };
};
