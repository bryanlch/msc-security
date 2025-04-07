import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Action } from '../action/entities/action.entity';
import { ResponseAPI } from 'src/enums/responses.enum';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,

    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async create(createModuleDto: CreateModuleDto) {
    try {
      const moduleExists = await this.moduleRepository.findOne({
        where: {
          name: createModuleDto.module.name,
          path: createModuleDto.module.path,
        },
      });

      if (moduleExists) {
        throw new Error(ResponseAPI.MODULE_EXISTS);
      }

      const newModule = await this.moduleRepository.create(
        createModuleDto.module,
      );
      await this.moduleRepository.save(newModule);

      const actions = createModuleDto.actions.map((action) => {
        const newAction = this.actionRepository.create({
          moduleId: newModule.id,
          action: action.action,
        });
        return newAction;
      });

      await this.actionRepository.save(actions);
      return {
        ...newModule,
        actions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const modules = await this.moduleRepository.find({
        relations: ['action'],
        order: {
          name: 'DESC',
        },
      });

      return modules;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllList() {
    try {
      const modules = await this.moduleRepository.find({
        where: { parentId: IsNull() },
        relations: ['action', 'childrenModules.action'],
        order: {
          name: 'DESC',
        },
      });
      modules.forEach((module) => {
        module.childrenModules.map((child) => {
          child.action = this.orderActions(child.action);
        });
      });
      return modules;
    } catch (error) {
      throw new Error(error);
    }
  }

  private orderActions(actions: Action[]) {
    const actionOrder = {
      READ: 1,
      CREATE: 2,
      WRITE: 3,
      DELETE: 4,
    };

    const compareActions = (actionA, actionB) => {
      const orderA = actionOrder[actionA.action];
      const orderB = actionOrder[actionB.action];
      return orderA - orderB;
    };

    return actions.sort(compareActions);
  }

  async findOne(moduleId: number) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['action', 'childrenModules.action'],
      });

      return module;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(
    id: number,
    updateModuleDto: UpdateModuleDto,
  ): Promise<UpdateModuleDto> {
    try {
      const { action, ...module } = await this.moduleRepository.findOne({
        where: { id },
        relations: ['action'],
      });
      if (!module) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }
      await this.moduleRepository.update(id, updateModuleDto.module);

      const existingActions = new Set(action.map((act) => act.action));

      const newActions = updateModuleDto.actions
        .filter((atn) => !existingActions.has(atn.action))
        .map((atn) => ({ moduleId: module.id, action: atn.action }));
      await this.actionRepository.insert(newActions);

      const deleteActions = action.filter(
        (act) =>
          !updateModuleDto.actions.find((atn) => atn.action === act.action),
      );

      await this.actionRepository.remove(deleteActions);

      return {
        module: updateModuleDto.module,
        actions: updateModuleDto.actions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number) {
    try {
      const { action, ...module } = await this.moduleRepository.findOne({
        where: { id },
        relations: ['action'],
      });
      if (!module) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      if (action && action.length > 0) {
        await this.actionRepository.remove(action);
      }

      await this.moduleRepository.delete(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
