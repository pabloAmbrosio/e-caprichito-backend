import { db } from "../../../lib/prisma";
import { userListSelect } from "../select";
import { ListUsersInput } from "../types";
import { buildWhereClause } from "../helpers";

export async function listUsersService(params: ListUsersInput) {
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = params;
  const skip = (page - 1) * limit;

  const where = buildWhereClause(params);
  
  const orderBy = { [sortBy]: sortOrder };

  const [users, totalItems] = await Promise.all([
    db.user.findMany({
      where,
      select: userListSelect,
      orderBy,
      skip,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: users,
    pagination: { page, limit, totalItems, totalPages },
    msg: "Usuarios listados exitosamente",
  };
}
