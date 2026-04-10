export { AdminRole, CustomerRole } from './prisma';

import { AdminRole } from './prisma';

export const STAFF_ROLES = [
  AdminRole.OWNER,
  AdminRole.ADMIN,
  AdminRole.MANAGER,
  AdminRole.SELLER,
] as const;

export const BUYER_ROLES = [
  AdminRole.CUSTOMER,
] as const;
