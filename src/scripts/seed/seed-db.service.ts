import { PrismaClient } from '../../lib/prisma';
import { resetDB } from './reset-db.service';
import { seedEssential } from './seed-essential.service';
import { seedDemo } from './seed-demo.service';
import { cleanupPaymentImages } from './cleanup-cloudinary';

export const seedDb = async (db: PrismaClient) => {
  console.log('🌱 Iniciando seed...');

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    await resetDB(db);
    console.log('🗑️  Datos anteriores eliminados');

    await cleanupPaymentImages();

    await seedDemo(db);
    console.log('🎭 Datos de demo listos');
  }

  await seedEssential(db);

  console.log('✅ Seed completado exitosamente');
};
