import type { Server } from "socket.io";

interface OrderCreatedNotification {
  orderId: string;
  customerUsername: string;
  itemCount: number;
  total: number;
}

export function emitOrderCreated(io: Server, payload: OrderCreatedNotification) {
  io.to("staff").emit("order:created", payload);
}
