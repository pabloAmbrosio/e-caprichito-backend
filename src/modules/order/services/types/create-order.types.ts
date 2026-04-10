export interface CheckoutInput {
  userId: string;
  addressId?: string;            // Si no se envía, se asume PICKUP
  discountTotalInCents?: number; // Centavos
  expirationMinutes?: number;
  paymentMethod?: string;        // CASH_ON_DELIVERY crea el pago inline
}

export interface CheckoutResult {
  orderId: string;
  status: string;
  itemCount: number;
  expiresAt: Date | null;
  deliveryFee: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  shipment: {
    id: string;
    type: string;
    status: string;
  };
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };
}
