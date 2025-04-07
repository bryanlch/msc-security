import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Action } from '../action/entities/action.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([Modules]),
    TypeOrmModule.forFeature([Action]),
  ],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ModuleModule { }
