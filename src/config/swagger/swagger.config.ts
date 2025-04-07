import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Security')
  .setDescription('The swagger for the security microservice')
  .setVersion('1.0')
  .build();

const options: SwaggerDocumentOptions = {
  deepScanRoutes: true,
};

const custom: SwaggerCustomOptions = {
  explorer: true,
  // useGlobalPrefix: true,
  // customfavIcon: 'icon',
};

export { config, options, custom };
