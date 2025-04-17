import { forwardRef, Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesEntity } from './entities/module.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ActionModule } from '../action/action.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([ModulesEntity]),
    forwardRef(() => ActionModule),
  ],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [ModuleService],
})
export class ModuleModule {}
