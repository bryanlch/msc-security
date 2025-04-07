import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseAPI } from 'src/enums/responses.enum';
import { User } from '../user/entities/user.entity';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const roleExists = await this.roleRepository.findOne({
        where: { name: createRoleDto.name },
      });
      if (roleExists) {
        throw new Error(ResponseAPI.ROLE_EXISTS);
      }

      const newRole = await this.roleRepository.create(createRoleDto);
      await this.roleRepository.save(newRole);

      const addAction = await this.permissionsService.create({
        rolId: newRole.id,
        actions: createRoleDto.permissions,
      });

      return {
        ...newRole,
        addAction,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const { permissions: actions, ...roleData } = updateRoleDto;
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new Error(ResponseAPI.ROLE_NOT_FOUND);
      }
      const nameExist = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });
      if (nameExist && nameExist.id !== id) {
        throw new Error(ResponseAPI.ROLE_NAME_EXISTS);
      }

      const permissions = await this.permissionsService.updateForRole(id, {
        actions: actions,
      });

      await this.roleRepository.update(id, roleData);

      return {
        permissions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const roles = await this.roleRepository.findAndCount({
        where: {
          status: true,
        },
        order: {
          name: 'ASC',
        },
        cache: true,
      });
      return roles;
    } catch (error) {
      throw new Error(error);
    }
  }

  async roleList(params) {
    try {
      const { search, pageNumber } = params;
      const value = search?.trim() ?? '';
      const likeValue = `%${value}%`;
      const number = pageNumber ?? 1;
      const offset = (number - 1) * 10;

      let whereQuery = {};
      if (search) {
        whereQuery = {
          where: [
            {
              name: Like(likeValue),
            },
          ],
        };
      }

      const roles = await this.roleRepository.findAndCount({
        ...whereQuery,
        order: {
          name: 'ASC',
        },
        skip: offset,
        take: 10,
        cache: true,
      });
      return roles;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        select: ['id', 'name', 'status'],
        cache: true,
      });
      if (!role) {
        throw new Error(ResponseAPI.ROLE_NOT_FOUND);
      }
      const permission = await this.permissionsService.findOneForRole(id);

      return {
        ...role,
        permission: permission?.module ?? [],
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateStatusRole(id: number, status: boolean) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new Error(ResponseAPI.ROLE_NOT_FOUND);
      }
      await this.roleRepository.update(id, { status });
      return { message: ResponseAPI.ROLE_UPDATED };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new Error(ResponseAPI.NOT_FOUND);
      }

      const roleWithUser = await this.userRepository.find({
        where: { rolId: id },
      });
      if (roleWithUser && roleWithUser.length > 0) {
        throw new Error(ResponseAPI.USER_ROLE_ASSIGN);
      }

      await this.permissionsService.removePermissionsByRol(id);

      await this.roleRepository.delete(id);
      return { message: ResponseAPI.DELETED_SUCCESSFUL };
    } catch (error) {
      throw new Error(error);
    }
  }
}
