import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {seedDb} from '../src/scripts/seed'
import pg from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// const users = [
//   { email: 'customer@caprichito.com', role: Role.CUSTOMER },
//   { email: 'vip@caprichito.com', role: Role.VIP_CUSTOMER },
//   { email: 'admin@caprichito.com', role: Role.ADMIN },
//   { email: 'superadmin@caprichito.com', role: Role.SUPER_ADMIN },
// ];

// const products = [
//   { title: 'Camiseta Básica' },
//   { title: 'Pantalón Casual' },
//   { title: 'Zapatos Deportivos' },
//   { title: 'Gorra Vintage' },
//   { title: 'Reloj Elegante' },
// ];

// const seed = async () => {
//   console.log('🌱 Iniciando seed...');

//   // Limpiar datos existentes
//   await prisma.cartItem.deleteMany();
//   await prisma.cart.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.user.deleteMany();

//   console.log('🗑️  Datos anteriores eliminados');

//   // Crear usuarios
//   for (const user of users) {
//     await prisma.user.create({ data: user });
//     console.log(`👤 Usuario creado: ${user.email} (${user.role})`);
//   }

//   // Crear productos
//   for (const product of products) {
//     await prisma.product.create({ data: product });
//     console.log(`📦 Producto creado: ${product.title}`);
//   }

//   console.log('✅ Seed completado exitosamente');
// };

seedDb(prisma)
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
