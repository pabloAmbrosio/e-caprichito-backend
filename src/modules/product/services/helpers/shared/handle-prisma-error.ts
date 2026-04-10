import { Prisma } from '../../../../../lib/prisma';
import { DuplicateEntryError } from '../../../errors';

// P2002 (unique constraint) → DuplicateEntryError; everything else re-thrown
export const handlePrismaError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new DuplicateEntryError();
  }
  throw error;
};
