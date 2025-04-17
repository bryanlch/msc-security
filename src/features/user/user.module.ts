import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { jwtConfig } from 'src/config/jwt/jwt.config';
import { UserEntity } from './entities/user.entity';
import { ProducerModule } from 'src/communications/producer/producer.module';
import { ConsumerModule } from 'src/communications/consumer/consumer.module';
import { KeyModule } from '../keys/key.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([UserEntity]),
    ProducerModule,
    ConsumerModule,
    KeyModule,
    forwardRef(() => PermissionsModule),
  ],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
