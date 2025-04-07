import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProducerService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async requestUserInfo(userId: string): Promise<string> {
    const requestId = uuidv4(); // Unique Id for the request
    const streamName = 'user_requests';

    // Send request to stream
    await this.redisClient.xadd(
      streamName,
      '*',
      'requestId',
      requestId,
      'userId',
      userId,
    );

    return requestId; // return id for relationshipt with request
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
