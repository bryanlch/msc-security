import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Action } from 'src/features/action/entities/action.entity';
import { Modules } from 'src/features/module/entities/module.entity';
import { Permission } from 'src/features/permissions/entities/permission.entity';


export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: +configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [
      Permission,
      Modules,
      Action,
    ],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
  }),
  inject: [ConfigService],
};
