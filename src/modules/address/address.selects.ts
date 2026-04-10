import { Prisma } from "../../lib/prisma";

export const addressSelect = {
  id: true,
  label: true,
  formattedAddress: true,
  details: true,
  lat: true,
  lng: true,
  isDefault: true,
  createdAt: true,
} satisfies Prisma.AddressSelect;
export const addressOwnershipSelect = {
  id: true,
  userId: true,
  isDefault: true,
} satisfies Prisma.AddressSelect;
