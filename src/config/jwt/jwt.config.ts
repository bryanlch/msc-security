import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    global: true,
    secret: configService.get<string>('JWT_SECRET_KEY'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
  }),
  inject: [ConfigService],
};
