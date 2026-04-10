import { redisClient } from '../../../../lib/redis';
import { db } from '../../../../lib/prisma';
import { userSelect } from '../../user.selects';

export const getRefreshToken = async (refreshToken: string) => {
  const raw = await redisClient.get(`rt:${refreshToken}`);

  if (!raw) return null;

  const { userId, expiresAt } = JSON.parse(raw) as { userId: string; expiresAt: string };

  const user = await db.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: userSelect
  });

  if (!user) return null;

  return {
    user,
    revoked: false,
    expiresAt: new Date(expiresAt),
    token: refreshToken
  };
};
