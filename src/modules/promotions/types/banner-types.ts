/**
 * Tipos para el endpoint GET /api/promotions/banners.
 *
 * Clasifica promos activas en 3 grupos:
 * - product: displayables a nivel de producto (bento grid / hero)
 * - cart: promos de carrito (mini banners / header)
 * - coupons: promos con cupón (sección especial)
 */

/** Campos visuales compartidos por los 3 tipos de banner */
interface BaseBanner {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly badgeText: string | null;
  readonly badgeColor: string | null;
  readonly colorPrimary: string | null;
  readonly colorSecondary: string | null;
  readonly endsAt: Date | null;
}

/** Promo displayable a nivel de producto — para bento grid con link a /productos */
export interface ProductBanner extends BaseBanner {
  readonly requiredRole: string | null;
  readonly isFirstPurchaseOnly: boolean;
  readonly action: {
    readonly type: 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y';
    readonly value: string;
  };
  readonly filters: {
    readonly categoryIds: string[];
    readonly tags: string[];
    readonly productIds: string[];
  };
}

/** Promo de carrito — para mini banners / header */
export interface CartBanner extends BaseBanner {}

/** Promo con cupón — para sección de cupones */
export interface CouponBanner extends BaseBanner {
  readonly couponCode: string;
}

/** Response shape del endpoint de banners */
export interface BannersResponse {
  readonly product: ProductBanner[];
  readonly cart: CartBanner[];
  readonly coupons: CouponBanner[];
}
