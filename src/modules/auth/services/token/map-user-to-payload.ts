import { TokenGenerationError } from '../../errors';
import type { revokeTokenAndRenew } from './revoke-token-and-renew';

export const mapUserToPayload = (user: NonNullable<Awaited<ReturnType<typeof revokeTokenAndRenew>>['user']>) => {
  if (!user.id) {
    throw new TokenGenerationError('mapUserToPayload: userId es requerido');
  }
  if (!user.username) {
    throw new TokenGenerationError('mapUserToPayload: username es requerido');
  }
  if (!user.adminRole) {
    throw new TokenGenerationError('mapUserToPayload: adminRole es requerido');
  }

  return {
    userId: user.id,
    username: user.username,
    phone: user.phone,
    email: user.email,
    adminRole: user.adminRole,
    customerRole: user.customerRole,
    phoneVerified: user.phoneVerified ?? false
  };
};
