import { Module } from '@nestjs/common';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';
import { Modules } from '../module/entities/module.entity';
import { Action } from './entities/action.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Modules]),
    TypeOrmModule.forFeature([Action]),
  ],
  controllers: [ActionController],
  providers: [ActionService],
})
export class ActionModule { }
