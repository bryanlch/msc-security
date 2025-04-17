import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProducerService {
  private readonly redisClient: Redis;

  constructor(private configService: ConfigService) {
    const redisEnabled = configService.get('REDIS_ENABLED') === 'true';
    if (redisEnabled) {
      this.redisClient = new Redis({
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      });
    }
  }

  async requestUserInfo(userId: string): Promise<string> {
    const requestId = uuidv4();
    const streamName = 'user_requests';

    await this.redisClient.xadd(
      streamName,
      '*',
      'requestId',
      requestId,
      'userId',
      userId,
    );

    return requestId;
  }

  async redisRequest(streamName: string, data) {
    await this.redisClient.xadd(
      streamName,
      '*',
      'requestId',
      data.id,
      'request_data',
      JSON.stringify(data),
    );

    return data.id;
  }
}
