import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Action } from '../action/entities/action.entity';
import { ResponseAPI } from 'src/enums/responses.enum';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const { actions, rolId } = createPermissionDto;

      const actionIds = actions.map((action) => action.id);
      const actionsExists = await this.actionRepository.find({
        where: { id: In(actionIds) },
        relations: ['module.parentModule.action'],
      });
      if (!actionsExists.length) {
        throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
      }

      //Validar que las acciones recibidas si existan
      actionsExists.forEach((act) => {
        const exists = actions.some((action) => action.id === act.id);
        if (!exists) {
          throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
        }
      });

      const uniqueIds = {};
      const moduleParent = actionsExists
        .filter((action) => action.module.parentId)
        .map((action) => {
          return action.module.parentModule.action.find(
            (act: any) => act.action === 'READ',
          );
        })
        .filter((item: any) => {
          if (!uniqueIds[item.id]) {
            uniqueIds[item.id] = true;
            return true;
          }
          return false;
        });

      //Crear los permisos para el rol con las acciones recibidas y los modulos padres
      const uniqueIdsActions = {};
      const addActions = [...actions, ...moduleParent].filter((item: any) => {
        if (!uniqueIdsActions[item.id]) {
          uniqueIdsActions[item.id] = true;
          return true;
        }
        return false;
      });

      const permissions = addActions.map((action: any) => {
        return this.permissionRepository.create({
          rolId,
          actionId: action.id,
        });
      });
      await this.permissionRepository.save(permissions);

      return addActions;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateForRole(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const { actions } = updatePermissionDto;

      const actionIds = actions.map((action) => action.id);
      const actionsRecive = await this.actionRepository.find({
        where: { id: In(actionIds) },
        relations: ['module.parentModule.action'],
      });
      if (!actionsRecive.length) {
        throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
      }

      const permissionsExists = await this.permissionRepository.find({
        where: { rolId: id },
      });

      const uniqueModuleParents = new Set();
      actionsRecive
        .filter((action) => action.module.parentId)
        .forEach((action) => {
          const parentAction = action.module.parentModule?.action.find(
            (act: any) => act.action === 'READ',
          );
          if (parentAction) {
            uniqueModuleParents.add(parentAction);
          }
        });

      const uniqueIds = {};
      const allActions = [...actionsRecive, ...uniqueModuleParents].filter(
        (item: any) => {
          if (!uniqueIds[item.id]) {
            uniqueIds[item.id] = true;
            return true;
          }
          return false;
        },
      );

      actionsRecive.forEach((act) => {
        const exists = actions.some((action) => action.id === act.id);
        if (!exists) {
          throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
        }
      });

      const addActions = allActions.filter(
        (act: any) =>
          !permissionsExists.find(
            (permission) => permission.actionId === act.id,
          ),
      );
      const removeActions = permissionsExists.filter(
        (permission) =>
          !allActions.find((act: any) => act.id === permission.actionId),
      );

      removeActions.map((action) => {
        return this.permissionRepository.delete(action.id);
      });

      const permissionsNewActions = addActions.map((action: any) => {
        return this.permissionRepository.create({
          rolId: id,
          actionId: action?.id,
        });
      });
      await this.permissionRepository.save(permissionsNewActions);

      return {
        addActions,
        removeActions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const permissions = await this.permissionRepository.find({
        relations: ['role', 'action.module'],
      });
      const grouped = await this.groupedRoleModule(permissions);
      return grouped;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: number) {
    try {
      const permission = await this.permissionRepository.find({
        where: { rolId: id },
        relations: ['role', 'action.module'],
      });

      if (!permission.length) {
        throw new Error(ResponseAPI.PERMISSIONS_NOT_FOUND);
      }

      const grouped = await this.groupedRoleModule(permission);
      return grouped[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneForRole(id: number) {
    try {
      const permission = await this.permissionRepository.find({
        where: { rolId: id },
        relations: ['role', 'action.module'],
      });

      if (!permission.length) {
        return [];
      }

      const grouped = await this.groupedRoleModule(permission);
      return grouped[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneForSingIn(id: number) {
    try {
      const permission = await this.permissionRepository.find({
        where: { rolId: id },
        relations: ['role', 'action.module'],
      });

      if (!permission.length) {
        const rol = await this.roleRepository.findOne({ where: { id } });
        return rol;
      }

      const grouped = await this.groupedRoleModule(permission);
      return grouped[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async findRolPermissions(id: number) {
    try {
      const permission = await this.permissionRepository.find({
        where: { rolId: id },
        relations: ['role', 'action.module'],
      });

      if (!permission.length) {
        throw new Error(ResponseAPI.PERMISSIONS_NOT_FOUND);
      }

      const grouped = await this.groupedRoleModule(permission);

      if (!grouped.length) {
        const rol = await this.roleRepository.findOne({ where: { id } });
        return {
          rolId: rol.id,
          name: rol.name,
          module: [],
        };
      }

      return grouped[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const { actions } = updatePermissionDto;
      const roleExists = await this.roleRepository.findOne({ where: { id } });
      if (!roleExists) {
        throw new Error(ResponseAPI.ROLE_NOT_FOUND);
      }

      const actionIds = actions.map((action) => action.id);
      const actionsRecive = await this.actionRepository.find({
        where: { id: In(actionIds) },
        relations: ['module.parentModule.action'],
      });
      if (!actionsRecive.length) {
        throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
      }

      const permissionsExists = await this.permissionRepository.find({
        where: { rolId: id },
      });

      const uniqueModuleParents = new Set();
      actionsRecive
        .filter((action) => action.module.parentId) // Filtrar solo los módulos que tienen parentId
        .forEach((action) => {
          const parentAction = action.module.parentModule?.action.find(
            (act: any) => act.action === 'READ',
          );
          if (parentAction) {
            uniqueModuleParents.add(parentAction);
          }
        });
      const allActions = [...actionsRecive, ...uniqueModuleParents];

      actionsRecive.forEach((act) => {
        const exists = actions.some((action) => action.id === act.id);
        if (!exists) {
          throw new Error(ResponseAPI.ACTION_NOT_FOUND_ALL);
        }
      });

      const addActions = allActions.filter(
        (act: any) =>
          !permissionsExists.find(
            (permission) => permission.actionId === act.id,
          ),
      );
      const removeActions = permissionsExists.filter(
        (permission) =>
          !allActions.find((act: any) => act.id === permission.actionId),
      );

      removeActions.map((action) => {
        return this.permissionRepository.delete(action.id);
      });

      const permissionsNewActions = [...addActions, ...uniqueModuleParents].map(
        (action: any) => {
          return this.permissionRepository.create({
            rolId: id,
            actionId: action?.id,
          });
        },
      );
      await this.permissionRepository.save(permissionsNewActions);

      return {
        addActions,
        removeActions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number) {
    try {
      const permissionExists = await this.permissionRepository.findOne({
        where: { id },
      });
      if (!permissionExists) {
        throw new Error(ResponseAPI.PERMISSION_NOT_FOUND);
      }

      return await this.permissionRepository.delete(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async removePermissionsByRol(rolId: number) {
    try {
      const permissionsExists = await this.permissionRepository.find({
        where: { rolId },
      });
      if (!permissionsExists.length) {
        throw new Error(ResponseAPI.PERMISSION_NOT_FOUND);
      }

      return await this.permissionRepository.delete({ rolId });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findRolById(id: number) {
    try {
      const rolAcive = await this.roleRepository.findOne({
        where: { id, status: true },
      });
      return rolAcive;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async groupedRoleModule(data: any) {
    try {
      const array = [];
      data.map((item: { action: any; rolId?: any; role?: any }) => {
        const {
          rolId,
          role,
          action: { module },
        } = item;

        let indexRol = array.findIndex((item) => item.rolId === rolId);
        if (indexRol < 0) {
          array.push({
            rolId,
            name: role.name,
            module: [],
          });
          indexRol = array.findIndex((item) => item.rolId === rolId);
        }

        if (item.action.module?.parentId) return;

        let indexModule = array[indexRol].module.findIndex(
          (i) => i.id === module.id,
        );
        if (indexModule < 0) {
          array[indexRol].module.push({ ...module, action: [], subModule: [] });
          indexModule = array[indexRol].module.findIndex(
            (i) => i.id === module.id,
          );
        }

        const obj = {
          id: item.action.id,
          action: item.action.action,
          moduleId: item.action.module.id,
        };
        array[indexRol].module[indexModule].action.push(obj);
      });

      const submodule = data
        .filter((item) => item.action.module?.parentId)
        .map((item) => ({
          ...item,
          module: item.action.module,
        }));

      const groupedByModule = submodule.reduce((acc, curr) => {
        const moduleId = curr.module.id;
        if (!acc[moduleId]) {
          acc[moduleId] = {
            ...curr.module,
            action: [],
          };
        }
        acc[moduleId].action.push({
          id: curr.action.id,
          action: curr.action.action,
          moduleId: curr.action.moduleId,
        });
        return acc;
      }, {});

      const result = Object.values(groupedByModule).map((module: any) => ({
        ...module,
      }));

      array.map((item) => {
        item.module.map((module) => {
          const subModule = result.filter((i) => i.parentId === module.id);
          if (subModule) {
            module.subModule.push(...subModule);
          }
        });
      });

      return array;
    } catch (error) {
      throw new Error(error);
    }
  }
}
