import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class ConsumerService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
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
