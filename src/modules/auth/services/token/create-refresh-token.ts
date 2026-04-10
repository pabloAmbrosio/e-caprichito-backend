import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../../../lib/redis';
import { REFRESH_TOKEN_SECONDS } from '../../constants';
import { calculateExpirationDate } from './get-token-expiration';

interface User {
  id: string;
  username: string;
  phone: string | null;
  email: string | null;
  adminRole: string;
  customerRole: string | null;
  phoneVerified?: boolean;
}

export const createRefreshToken = async (user: User): Promise<string> => {
  const token = uuidv4();
  const expiresAt = calculateExpirationDate(REFRESH_TOKEN_SECONDS);

  await redisClient.set(
    `rt:${token}`,
    JSON.stringify({ userId: user.id, expiresAt: expiresAt.toISOString() }),
    'EX',
    REFRESH_TOKEN_SECONDS
  );

  await redisClient.sadd(`rt:user:${user.id}`, token);

  return token;
};
