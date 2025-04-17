import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsumerService {
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

  async searchQueu(uuid: string, streamName) {
    const messages = await this.redisClient.xread('STREAMS', streamName, '0');

    if (messages) {
      for (const [_, items] of messages) {
        for (const [id, fields] of items) {
          const responseRequestId = fields[fields.indexOf('requestId') + 1];
          if (responseRequestId === uuid) {
            const recovery = JSON.parse(
              fields[fields.indexOf('request_data') + 1],
            );
            return { id, recovery };
          }
        }
      }
    }

    return {};
  }

  async deleteQeue(streamName: string, uuid: string) {
    this.redisClient.xdel('STREAMS', streamName, '0', uuid);
  }
}
