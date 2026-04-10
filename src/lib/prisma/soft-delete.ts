import { PrismaClient } from '../../generated/prisma/client';

// Auto-filter extension for Prisma queries.
//
// — User/Address: filtra deletedAt != null (soft-delete clásico)
// — Category: filtra isActive = false
//
// Bypass para Category: usar 'isActive' in where con valor undefined.
// El operador 'in' de JS detecta que la key EXISTE en el objeto aunque valga undefined,
// así el auto-filter no inyecta isActive: true. Pero Prisma ignora keys con valor undefined,
// así que no genera WHERE en el SQL. Resultado: trae activas e inactivas.
//
// Ejemplo de bypass:
//   db.category.findMany({ where: { isActive: undefined } })  → trae todas
//   db.category.findMany({ where: {} })                       → solo activas (auto-filter)
//   db.category.findMany()                                    → solo activas (auto-filter)

export const withSoftDelete = (prisma: PrismaClient) =>
  prisma.$extends({
    query: {
      user: {
        async findFirst({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findMany({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          if (!(args.where as any)?.deletedAt) {
            (args.where as any) = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
      },
      address: {
        async findFirst({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findMany({ args, query }) {
          if (!args.where?.deletedAt) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          if (!(args.where as any)?.deletedAt) {
            (args.where as any) = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
      },
      // 'in' operator en vez de === undefined para permitir bypass (ver comentario arriba)
      category: {
        async findFirst({ args, query }) {
          if (!('isActive' in (args.where || {}))) {
            args.where = { ...args.where, isActive: true };
          }
          return query(args);
        },
        async findMany({ args, query }) {
          if (!('isActive' in (args.where || {}))) {
            args.where = { ...args.where, isActive: true };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          if (!('isActive' in ((args.where as any) || {}))) {
            (args.where as any) = { ...args.where, isActive: true };
          }
          return query(args);
        },
      },
    },
  });
