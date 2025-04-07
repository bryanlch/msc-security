import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { PermissionsService } from '../permissions/permissions.service';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { Action } from '../action/entities/action.entity';
import { ProducerModule } from 'src/communications/producer/producer.module';
import { ConsumerModule } from 'src/communications/consumer/consumer.module';
import { KeyModule } from '../key/key.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([User, Permission, Role, Action]),
    ProducerModule,
    ConsumerModule,
    KeyModule,
  ],
  providers: [
    UserService,
    PermissionsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
