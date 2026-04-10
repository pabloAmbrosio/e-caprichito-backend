import { Prisma } from "../../../lib/prisma";
import { AdminRole, CustomerRole } from "../../../lib/roles";
import { userListSelect } from "../select";

export interface ListUsersInput {
  page?: number;
  limit?: number;
  adminRole?: AdminRole;
  customerRole?: CustomerRole;
  search?: string;
  sortBy?: "createdAt" | "username" | "email" | "adminRole";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export type UserListItem = Prisma.UserGetPayload<{ select: typeof userListSelect }>;

export interface ListUsersResult {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
