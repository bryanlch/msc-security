import { RedisOptions } from 'ioredis';

const redisConfig = (host, port) => {
  const redis: RedisOptions = {
    host,
    port,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 5000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  };
  return redis;
};

export { redisConfig };
