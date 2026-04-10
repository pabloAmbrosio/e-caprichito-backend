import { Prisma } from "../../../../lib/prisma";
import { db } from "../../../../lib/prisma";
import { cartSelect } from "../../cart.selects";


const createCart = async (customerId: string) => {
  const cart = await db.cart.create({
    data: { customerId },
    select: cartSelect,
  });

  await db.user.update({
    where: { id: customerId },
    data: { activeCartId: cart.id },
  });

  return cart;
}

// On race condition (P2002 unique constraint), retries the read
export const getOrCreateCart = async (customerId: string) => {
  const user = await db.user.findUnique({
    where: { id: customerId },
    select: { activeCartId: true },
  });

  if (user?.activeCartId) {
    const cart = await db.cart.findUnique({
      where: { id: user.activeCartId, deletedAt: null },
      select: cartSelect,
    });
    if (cart) return cart;
  }

  try {
    return await createCart(customerId);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const retried = await db.user.findUnique({
        where: { id: customerId },
        select: { activeCart: { select: cartSelect } },
      });
      if (retried?.activeCart) return retried.activeCart;
    }
    throw error;
  }
}