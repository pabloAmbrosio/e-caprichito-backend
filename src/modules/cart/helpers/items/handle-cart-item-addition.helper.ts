import { Prisma } from "../../../../lib/prisma";
import { db } from "../../../../lib/prisma";
import { CreateCartItemInput } from "../../schemas";
import {
  ProductNotFoundError,
  CartItemNotFoundError,
  OutOfStockError,
  MaxQuantityExceededError,
  MaxItemsExceededError,
} from "../../errors";
import { isInStock } from "../../adapters/inventory.adapter";
import { MAX_QUANTITY_PER_ITEM, MAX_ITEMS_PER_CART } from "../../cart.config";

type CartAction =
  | { action: "added" }
  | { action: "updated" }
  | { action: "removed" };

async function assertProductExists(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, deletedAt: true },
  });
  if (!product || product.deletedAt) throw new ProductNotFoundError(productId);
}

async function assertInStock(productId: string) {
  const available = await isInStock(productId);
  if (!available) throw new OutOfStockError(productId);
}

function assertQuantityLimit(quantity: number) {
  if (quantity > MAX_QUANTITY_PER_ITEM) {
    throw new MaxQuantityExceededError(MAX_QUANTITY_PER_ITEM);
  }
}

async function removeItem(itemId: string): Promise<CartAction> {
  await db.cartItem.delete({ where: { id: itemId } });
  return { action: "removed" };
}

async function updateItem(itemId: string, newQuantity: number): Promise<CartAction> {
  assertQuantityLimit(newQuantity);

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity: newQuantity },
  });
  return { action: "updated" };
}

async function addItem(cartId: string, productId: string, quantity: number): Promise<CartAction> {

  if (quantity <= 0) throw new CartItemNotFoundError(productId);

  assertQuantityLimit(quantity);
  await assertInStock(productId);

  await db.$transaction(async (tx) => {
    const count = await tx.cartItem.count({ where: { cartId } });
    if (count >= MAX_ITEMS_PER_CART) throw new MaxItemsExceededError(MAX_ITEMS_PER_CART);

    await tx.cartItem.create({ data: { cartId, productId, quantity } });
  });

  return { action: "added" };
}

export async function handleCartItemAddition(
  cartId: string,
  { productId, quantity }: CreateCartItemInput,
): Promise<CartAction> {
  await assertProductExists(productId);

  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
    select: { id: true, quantity: true },
  });

  if (existing) {
    const newQuantity = existing.quantity + quantity;
    return newQuantity <= 0
      ? removeItem(existing.id)
      : updateItem(existing.id, newQuantity);
  }

  return addItem(cartId, productId, quantity);
}
