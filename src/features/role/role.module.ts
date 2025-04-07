import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { User } from '../user/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Action } from '../action/entities/action.entity';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([
      Role,
      User,
      Permission,
      Action
    ])
  ],
  controllers: [RoleController],
  providers: [
    RoleService,
    PermissionsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class RoleModule { }
