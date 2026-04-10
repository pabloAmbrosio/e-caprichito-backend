import { AdminRole } from "../../../lib/roles";

// Owner inicial del sistema — se crea con upsert en todos los ambientes
export const OWNER_ESSENTIAL = {
  username: 'caprichito',
  email: 'owner@caprichito.com',
  phone: '+15551234000',
  firstName: 'Caprichito',
  lastName: 'Owner',
  adminRole: AdminRole.OWNER,
  phoneVerified: true,
  emailVerified: true,
  passwordHash: '$2b$10$zW004YIj8uk/DaB5tMHzx.RfHu7k6KAVpVQokjy8JD.V0WL6rTZf2' // Owner123
};
