import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ModulesEntity } from './entities/module.entity';
import { ActionsEntity } from '../action/entities/action.entity';
import { ResponseAPI } from 'src/enums/responses.enum';
import { ActionService } from '../action/action.service';
import { WrapperType } from 'src/commons/wrapper-types';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModulesEntity)
    private readonly moduleRepository: Repository<ModulesEntity>,

    @Inject(forwardRef(() => ActionService))
    private readonly actionService: WrapperType<ActionService>,
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

      const arrayActions = createModuleDto.actions.map((action) => ({
        moduleId: newModule.id,
        action: action.action,
      }));

      const actions = await this.actionService.createBulk(arrayActions);

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

  private orderActions(actions: ActionsEntity[]) {
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
      await this.actionService.createBulk(newActions);

      const deleteActions = action.filter(
        (act) =>
          !updateModuleDto.actions.find((atn) => atn.action === act.action),
      );

      await this.actionService.removeBulk(deleteActions);

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
        await this.actionService.removeByModuleId(id);
      }

      await this.moduleRepository.delete(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
