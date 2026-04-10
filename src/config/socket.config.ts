// ── Rooms ────────────────────────────────────────────
export const SOCKET_ROOMS = {
  user: (userId: string) => `user:${userId}`,
  staff: 'staff',
} as const;

// ── Events ───────────────────────────────────────────
export const SOCKET_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_EXPIRED: 'order:expired',
  ORDER_CANCELLED: 'order:cancelled',
  SHIPMENT_UPDATED: 'shipment:updated',
  PAYMENT_PROOF_UPLOADED: 'payment:proof-uploaded',
  PAYMENT_EXPIRED: 'payment:expired',
} as const;
