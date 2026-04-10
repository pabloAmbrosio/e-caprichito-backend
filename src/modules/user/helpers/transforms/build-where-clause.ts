import { Prisma } from "../../../../lib/prisma";
import { AdminRole, CustomerRole } from "../../../../lib/roles";
import { ListUsersInput } from "../../types";

const buildSearchFilter = (search: string): Prisma.UserWhereInput => ({
  OR: [
    { username: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
    { firstName: { contains: search, mode: "insensitive" } },
    { lastName: { contains: search, mode: "insensitive" } },
  ],
});

const buildRoleFilter = (role: AdminRole): Prisma.UserWhereInput => ({ adminRole: role });

const buildCustomerRoleFilter = (role: CustomerRole): Prisma.UserWhereInput => ({ customerRole: role });

export const buildWhereClause = (query: ListUsersInput): Prisma.UserWhereInput => {
  const conditions: Prisma.UserWhereInput[] = [];

  if (!query.includeDeleted) conditions.push({ deletedAt: null });
  if (query.adminRole)       conditions.push(buildRoleFilter(query.adminRole));
  if (query.customerRole)    conditions.push(buildCustomerRoleFilter(query.customerRole));
  if (query.search)          conditions.push(buildSearchFilter(query.search));

  return conditions.length > 0 ? { AND: conditions } : {};
}
