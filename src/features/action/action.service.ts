import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionsEntity } from './entities/action.entity';
import { In, Repository } from 'typeorm';
import { ResponseAPI } from 'src/enums/responses.enum';

@Injectable()
export class ActionService {
  constructor(
    @InjectRepository(ActionsEntity)
    private readonly actionRepository: Repository<ActionsEntity>,
  ) {}

  async findAll() {
    try {
      const actions = await this.actionRepository.find();
      return actions;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number) {
    try {
      const action = await this.actionRepository.findOne({ where: { id } });
      if (!action) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      await this.actionRepository.delete(id);
      return ResponseAPI.DELETED_SUCCESSFUL;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createBulk(actions: { moduleId: number; action: string }[]) {
    try {
      const actionExists = await this.actionRepository.findOne({
        where: {
          action: In(actions.map((action) => action.action)),
          moduleId: In(actions.map((action) => action.moduleId)),
        },
      });

      if (actionExists) {
        throw new Error(ResponseAPI.ACTION_EXISTS);
      }

      const newActions = await this.actionRepository.create(actions);
      await this.actionRepository.save(newActions);

      return newActions;
    } catch (error) {
      throw new Error(error);
    }
  }

  async removeByModuleId(moduleId: number) {
    try {
      const actions = await this.actionRepository.find({
        where: { moduleId },
      });
      if (!actions) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      await this.actionRepository.delete(actions.map((action) => action.id));
      return ResponseAPI.DELETED_SUCCESSFUL;
    } catch (error) {
      throw new Error(error);
    }
  }

  async removeBulk(actions: { id: number }[]) {
    try {
      await this.actionRepository.delete(actions.map((action) => action.id));

      return ResponseAPI.DELETED_SUCCESSFUL;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByIds(ids: number[]) {
    try {
      const actions = await this.actionRepository.find({
        where: { id: In(ids) },
        relations: ['module.parentModule.action'],
      });
      if (!actions) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      return actions;
    } catch (error) {
      throw new Error(error);
    }
  }
}
