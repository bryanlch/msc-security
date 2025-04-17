import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsEntity } from './entities/permission.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ActionModule } from '../action/action.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([PermissionsEntity]),
    forwardRef(() => ActionModule),
    forwardRef(() => RoleModule),
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
