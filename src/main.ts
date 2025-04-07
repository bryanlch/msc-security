import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config, custom, options } from './config/swagger/swagger.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisOptions } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('SV_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      whitelist: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document, custom);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: 'redis://localhost:6379',
    } as RedisOptions,
  });
  app.setGlobalPrefix('auth');

  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
