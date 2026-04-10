import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../../../lib/redis';
import { REFRESH_TOKEN_SECONDS } from '../../constants';
import { calculateExpirationDate } from './get-token-expiration';

export const createRefreshTokenForUser = async (userId: string): Promise<string> => {
  const token = uuidv4();
  const expiresAt = calculateExpirationDate(REFRESH_TOKEN_SECONDS);

  await redisClient.set(
    `rt:${token}`,
    JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }),
    'EX',
    REFRESH_TOKEN_SECONDS
  );

  await redisClient.sadd(`rt:user:${userId}`, token);

  return token;
};
