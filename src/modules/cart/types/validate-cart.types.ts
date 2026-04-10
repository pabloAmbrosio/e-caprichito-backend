export type IssueType =
  | "PRODUCT_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "PRICE_CHANGED"
  | "COUPON_INVALID";

export interface CartIssue {
  type: IssueType;
  productId?: string;
  detail: string;
}

export interface ValidateCartItem {
  productId: string;
  product: { title: string; priceInCents: number };
}

export interface FreshProduct {
  id: string;
  priceInCents: number;
  deletedAt: Date | null;
}

export interface ValidateCartResult {
  message: string;
  data: { valid: boolean; issues: CartIssue[] };
}
