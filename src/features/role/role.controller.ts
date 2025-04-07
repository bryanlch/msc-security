import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  InternalServerErrorException,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseAPI } from 'src/enums/responses.enum';
import { Response } from 'express';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UpsertRoleDto } from './dto/upsert-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'Create role',
    description: 'Create a new role',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        role: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @Res() res: Response) {
    try {
      const newRol = await this.roleService.create(createRoleDto);
      res.status(201).send({
        message: ResponseAPI.CREATE_SUCCESSFUL,
        role: newRol,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Create or update role',
    description: 'Create or update a role',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        role: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post('upsert')
  async upsert(@Body() upsertRoleDto: UpsertRoleDto, @Res() res: Response) {
    try {
      const rolId = upsertRoleDto?.id;
      if (rolId) {
        const role = await this.roleService.update(rolId, upsertRoleDto);
        return res.status(201).send({
          message: ResponseAPI.ROLE_UPDATED,
          role,
        });
      }

      const role = await this.roleService.create(upsertRoleDto);
      return res.status(201).send({
        message: ResponseAPI.ROLE_CREATED,
        role,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.ROLE_UPSERT_ERROR,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Get all roles',
    description: 'Get all roles',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        roles: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    try {
      const roles = await this.roleService.findAll();
      return {
        message: ResponseAPI.ITEMS_FOUND,
        list: roles[0],
        count: roles[1],
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Get all roles',
    description: 'Get all roles',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        roles: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('list')
  async findWithParams(@Query() params: any) {
    try {
      const roles = await this.roleService.roleList(params);
      return {
        message: ResponseAPI.ITEMS_FOUND,
        list: roles[0],
        count: roles[1],
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Get role by id',
    description: 'Get role by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        role: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const role = await this.roleService.findOne(+id);
      return {
        message: ResponseAPI.ROLE_FOUND,
        role,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }

  @ApiOperation({
    summary: 'Update status role',
    description: 'Update status role by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        role: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put('status/:id')
  async updateStatusRol(
    @Param('id') id: string,
    @Body() body: { status: boolean },
  ) {
    try {
      const role = await this.roleService.updateStatusRole(+id, body.status);
      return role;
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message.replace(/Error:\s*/g, ''),
        error: ResponseAPI.ROLE_UPDATED_ERROR,
      });
    }
  }

  @ApiOperation({
    summary: 'Update role',
    description: 'Update role by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.ROLE_UPDATED,
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleService.update(+id, updateRoleDto);
      return {
        message: ResponseAPI.ROLE_UPDATED,
        role,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Delete role',
    description: 'Delete role by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.DELETED_SUCCESSFUL,
      },
    },
  })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.roleService.remove(+id);
      return {
        message: ResponseAPI.DELETED_SUCCESSFUL,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message.replace(/Error:\s*/g, ''),
      });
    }
  }
}
