import { InvalidStatusTransitionError } from '../../../errors';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT:     ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  ARCHIVED:  ['DRAFT'],
};

export const validateStatusTransition = (from: string, to: string): void => {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidStatusTransitionError(from, to, allowed);
  }
};
