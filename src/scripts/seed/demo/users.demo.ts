import { AdminRole, CustomerRole } from "../../../lib/roles";

// Passwords: Owner123, Admin123, Manager123, Seller123, Customer123, VipFan123, VipLover123, VipLegend123
export const DEMO_USERS = [
  // ─── OWNER (3) ───────────────────────────────────────────────
  {
    username: 'owner1',
    email: 'owner1@caprichito.com',
    phone: '+15551234001',
    firstName: 'Luis',
    lastName: 'Morales',
    adminRole: AdminRole.OWNER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$zW004YIj8uk/DaB5tMHzx.RfHu7k6KAVpVQokjy8JD.V0WL6rTZf2' // Owner123
  },
  {
    username: 'owner2',
    email: 'owner2@caprichito.com',
    phone: '+15551234002',
    firstName: 'Sofía',
    lastName: 'Reyes',
    adminRole: AdminRole.OWNER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$zW004YIj8uk/DaB5tMHzx.RfHu7k6KAVpVQokjy8JD.V0WL6rTZf2' // Owner123
  },
  {
    username: 'owner3',
    email: 'owner3@caprichito.com',
    phone: '+15551234003',
    firstName: 'Carlos',
    lastName: 'Vega',
    adminRole: AdminRole.OWNER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$zW004YIj8uk/DaB5tMHzx.RfHu7k6KAVpVQokjy8JD.V0WL6rTZf2' // Owner123
  },

  // ─── ADMIN (3) ───────────────────────────────────────────────
  {
    username: 'admin1',
    email: 'admin1@caprichito.com',
    phone: '+15551234004',
    firstName: 'Ana',
    lastName: 'Torres',
    adminRole: AdminRole.ADMIN,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Icy1cw4LwX8iGgvbrQABBubbAbr9ZbIA.KZI9XN7VmYMmoea35YKG' // Admin123
  },
  {
    username: 'admin2',
    email: 'admin2@caprichito.com',
    phone: '+15551234005',
    firstName: 'Diego',
    lastName: 'Mendoza',
    adminRole: AdminRole.ADMIN,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Icy1cw4LwX8iGgvbrQABBubbAbr9ZbIA.KZI9XN7VmYMmoea35YKG' // Admin123
  },
  {
    username: 'admin3',
    email: 'admin3@caprichito.com',
    phone: '+15551234006',
    firstName: 'Valeria',
    lastName: 'Cruz',
    adminRole: AdminRole.ADMIN,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Icy1cw4LwX8iGgvbrQABBubbAbr9ZbIA.KZI9XN7VmYMmoea35YKG' // Admin123
  },

  // ─── MANAGER (3) ─────────────────────────────────────────────
  {
    username: 'manager1',
    email: 'manager1@caprichito.com',
    phone: '+15551234007',
    firstName: 'Pedro',
    lastName: 'Herrera',
    adminRole: AdminRole.MANAGER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Px8dttkAwbDj06zzTP/zlOxEC8MGoB7jbHVqq7QRSLkJiaHOVg5Wu' // Manager123
  },
  {
    username: 'manager2',
    email: 'manager2@caprichito.com',
    phone: '+15551234008',
    firstName: 'Laura',
    lastName: 'Jiménez',
    adminRole: AdminRole.MANAGER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Px8dttkAwbDj06zzTP/zlOxEC8MGoB7jbHVqq7QRSLkJiaHOVg5Wu' // Manager123
  },
  {
    username: 'manager3',
    email: 'manager3@caprichito.com',
    phone: '+15551234009',
    firstName: 'Miguel',
    lastName: 'Romero',
    adminRole: AdminRole.MANAGER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$Px8dttkAwbDj06zzTP/zlOxEC8MGoB7jbHVqq7QRSLkJiaHOVg5Wu' // Manager123
  },

  // ─── SELLER (3) ──────────────────────────────────────────────
  {
    username: 'seller1',
    email: 'seller1@caprichito.com',
    phone: '+15551234010',
    firstName: 'Isabella',
    lastName: 'López',
    adminRole: AdminRole.SELLER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$W1ivBltDRjQ3aTI7l0ZlneC.UoloPq4I7ERnAAXQGgGbOGbo5NVQW' // Seller123
  },
  {
    username: 'seller2',
    email: 'seller2@caprichito.com',
    phone: '+15551234011',
    firstName: 'Roberto',
    lastName: 'Gutiérrez',
    adminRole: AdminRole.SELLER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$W1ivBltDRjQ3aTI7l0ZlneC.UoloPq4I7ERnAAXQGgGbOGbo5NVQW' // Seller123
  },
  {
    username: 'seller3',
    email: 'seller3@caprichito.com',
    phone: '+15551234012',
    firstName: 'Camila',
    lastName: 'Flores',
    adminRole: AdminRole.SELLER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$W1ivBltDRjQ3aTI7l0ZlneC.UoloPq4I7ERnAAXQGgGbOGbo5NVQW' // Seller123
  },

  // ─── CUSTOMER: MEMBER (1) ─────────────────────────────────────
  {
    username: 'member1',
    email: 'member1@caprichito.com',
    phone: '+15551234013',
    firstName: 'Juan',
    lastName: 'Ramírez',
    adminRole: AdminRole.CUSTOMER,
    customerRole: CustomerRole.MEMBER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$635paRLpqCbZK0cbADFGq.Zi/joOSvyPiyByEHwGIyegC4h9C/Vd6' // Customer123
  },

  // ─── CUSTOMER: VIP_FAN (1) ────────────────────────────────────
  {
    username: 'vipfan1',
    email: 'vipfan1@caprichito.com',
    phone: '+15551234014',
    firstName: 'Mariana',
    lastName: 'Vargas',
    adminRole: AdminRole.CUSTOMER,
    customerRole: CustomerRole.VIP_FAN,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$bG3O8l4XqRdPKkL7FFSKAu0sRtP6DmcnuEA7xRPUBDVZxl12EayBu' // VipFan123
  },

  // ─── CUSTOMER: VIP_LOVER (1) ──────────────────────────────────
  {
    username: 'viplover1',
    email: 'viplover1@caprichito.com',
    phone: '+15551234015',
    firstName: 'Fernando',
    lastName: 'Castillo',
    adminRole: AdminRole.CUSTOMER,
    customerRole: CustomerRole.VIP_LOVER,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$W5U0ZDRr.YwwCrI02j8m6OUQk4Xb1XegWz0aZONY6Jubyn7LM0d9i' // VipLover123
  },

  // ─── CUSTOMER: VIP_LEGEND (1) ─────────────────────────────────
  {
    username: 'viplegend1',
    email: 'viplegend1@caprichito.com',
    phone: '+15551234016',
    firstName: 'Valentina',
    lastName: 'Soto',
    adminRole: AdminRole.CUSTOMER,
    customerRole: CustomerRole.VIP_LEGEND,
    phoneVerified: true,
    emailVerified: true,
    passwordHash: '$2b$10$4Unt8cGUL0.cFC3U0WKK8.RdZlfB76/SCSrraFQvaZmvzFDXgg6om' // VipLegend123
  },
];
