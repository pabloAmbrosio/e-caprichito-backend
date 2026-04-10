import Redis from 'ioredis';
import { env } from '../config/env';

const retryStrategy = (times: number) => Math.min(times * 50, 2000);

function createRedisClient(): Redis {
  
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy,
    });
  }

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy,
  });
}

export const redisClient = createRedisClient();
