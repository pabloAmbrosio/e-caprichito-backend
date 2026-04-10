import { Prisma } from '../../generated/prisma/client';

// Wrapper para las utilidades SQL de Prisma.
// Los módulos importan de aquí en vez de directamente del cliente generado.
export const sql = Prisma.sql;
export const join = Prisma.join;
export const empty = Prisma.empty;

export type Sql = Prisma.Sql;

// Filter callback para descartar fragmentos vacíos: ctes.filter(isNotEmpty)
export const isNotEmpty = (fragment: Sql): boolean => fragment !== empty;

// Ensambla CTEs en una cláusula WITH RECURSIVE separados por coma
export const withRecursive = (ctes: Sql[]): Sql => sql`WITH RECURSIVE ${join(ctes, ',')}`;

// Une fragmentos SQL con espacio (ideal para JOINs)
export const joinAll = (fragments: Sql[]): Sql => fragments.length === 0 ? empty : join(fragments, ' ');
