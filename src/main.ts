import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config, custom, options } from './config/swagger/swagger.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisOptions } from 'ioredis';
import { redisConfig } from './config/redis/redis.config';
import { AppMessages, ErrorMessages } from './constants/messages.constants';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log(AppMessages.BOOTSTRAP_START);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('SV_PORT');

  if (!port) {
    logger.error(ErrorMessages.CONFIG_MISSING.replace('{key}', 'SV_PORT'));
    process.exit(1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: configService.get('NODE_ENV') !== 'production',
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  logger.log(AppMessages.VALIDATION_PIPE);

  if (configService.get('NODE_ENV') !== 'production') {
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, document, custom);
    logger.log(AppMessages.SWAGGER_AVAILABLE);
  }

  try {
    const host = configService.get('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(configService.get('REDIS_PORT')) || 6379;

    logger.log(
      AppMessages.REDIS_CONNECTING.replace('{host}', host).replace(
        '{port}',
        redisPort.toString(),
      ),
    );

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: redisConfig(host, redisPort),
    });

    await app.startAllMicroservices();
    logger.log(AppMessages.REDIS_SUCCESS);
  } catch (error) {
    logger.error(AppMessages.REDIS_ERROR.replace('{message}', error.message));
    logger.warn(AppMessages.REDIS_FALLBACK);
  }

  app.setGlobalPrefix('auth');
  logger.log(AppMessages.GLOBAL_PREFIX.replace('{prefix}', 'auth'));

  app.enableShutdownHooks();
  logger.log(AppMessages.SHUTDOWN_HOOKS);

  await app.listen(port);
  logger.log(AppMessages.SERVER_LISTENING.replace('{port}', port));
  logger.log(
    AppMessages.ENVIRONMENT.replace(
      '{env}',
      configService.get('NODE_ENV') || 'development',
    ),
  );
}

bootstrap();
