import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { KeyController } from './key.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt/jwt.config';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig)],
  controllers: [KeyController],
  providers: [
    KeyService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [KeyService],
})
export class KeyModule {}
