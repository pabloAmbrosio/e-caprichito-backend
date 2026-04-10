import { getOrCreateCart } from "../helpers/cart";

export type Cart = Awaited<ReturnType<typeof getOrCreateCart>>;

export type CartItem = Cart["items"][number];
