import type {
  OrderStatus,
  CustomerRole,
  PaymentStatus,
  PaymentMethod,
  ShipmentStatus,
  DeliveryType,
} from "../../../../lib/prisma";

export interface OrderSearchCustomer {
  id: string;
  username: string;
  email: string | null;
  customerRole: CustomerRole | null;
}

export interface OrderSearchProduct {
  id: string;
  title: string;
  sku: string;
  priceInCents: number;
  images: unknown;
}

export interface OrderSearchItem {
  id: string;
  quantity: number;
  product: OrderSearchProduct;
}

export interface OrderSearchPayment {
  id: string;
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
  createdAt: Date;
}

export interface OrderSearchAddress {
  id: string;
  label: string;
  formattedAddress: string;
  details: string | null;
  lat: string;
  lng: string;
}

export interface OrderSearchShipment {
  id: string;
  status: ShipmentStatus;
  type: DeliveryType;
  carrier: string | null;
  trackingCode: string | null;
  deliveryFee: number;
  estimatedAt: Date | null;
  deliveredAt: Date | null;
  address: OrderSearchAddress | null;
}

export interface OrderSearchRow {
  id: string;
  status: OrderStatus;
  discountTotalInCents: number | null;
  expiresAt: Date | null;
  createdAt: Date;
  customer: OrderSearchCustomer;
  items: OrderSearchItem[];
  payments: OrderSearchPayment[];
  shipment: OrderSearchShipment | null;
  _count: { items: number };
}

export interface PaginatedOrders {
  items: OrderSearchRow[];
  total: number;
}
