import { PrismaClient } from '../../lib/prisma';
import { OWNER_ESSENTIAL } from './essential/owner.essential';

export const seedEssential = async (db: PrismaClient) => {
  await db.user.upsert({
    where: { username: OWNER_ESSENTIAL.username },
    update: {},
    create: OWNER_ESSENTIAL,
  });

  console.log(`👑 Owner esencial listo: ${OWNER_ESSENTIAL.email}`);
};
