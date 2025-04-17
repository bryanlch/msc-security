import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './entities/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UserModule } from '../user/user.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([RolesEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [RoleService],
})
export class RoleModule {}
