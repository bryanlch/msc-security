import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm/typeorm.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt/jwt.config';
import { UserModule } from './features/user/user.module';
import { RoleModule } from './features/role/role.module';
import { ModuleModule } from './features/module/module.module';
import { ActionModule } from './features/action/action.module';
import { PermissionsModule } from './features/permissions/permissions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { KeyModule } from './features/keys/key.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    JwtModule.registerAsync(jwtConfig),
    UserModule,
    RoleModule,
    ModuleModule,
    ActionModule,
    PermissionsModule,
    KeyModule,
  ],
})
export class AppModule {}
