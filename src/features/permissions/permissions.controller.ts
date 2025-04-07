import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  InternalServerErrorException,
  UseGuards,
  Res,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseAPI } from 'src/enums/responses.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('permission')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({
    summary: 'Create permission',
    description: 'Create a new permission',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        permission: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Res() res: Response,
  ) {
    try {
      const newPermission =
        await this.permissionsService.create(createPermissionDto);

      return res.status(201).send({
        message: ResponseAPI.PERMISSION_CREATE_SUCCESSFUL,
        permission: newPermission,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.PERMISSION_CREATE_ERROR,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Get all permissions',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        permissions: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    try {
      const permissions = await this.permissionsService.findAll();
      return {
        message: ResponseAPI.PERMISSIONS_FOUND,
        permissions,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.PERMISSIONS_NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get permission by id',
    description: 'Get permission by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        permission: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const permission = await this.permissionsService.findOne(+id);
      return {
        message: ResponseAPI.PERMISSION_FOUND,
        permission,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.PERMISSIONS_NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Update permission',
    description: 'Update permission by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        permission: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      const updatedPermission = await this.permissionsService.update(
        +id,
        updatePermissionDto,
      );

      return {
        message: ResponseAPI.PERMISSION_UPDATE_SUCCESSFUL,
        update: updatedPermission,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_PROCESS,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Delete permission',
    description: 'Delete permission by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        permission: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.permissionsService.remove(+id);
      return {
        message: ResponseAPI.PERMISSION_DELETE_SUCCESSFUL,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.PERMISSIONS_NOT_FOUND,
        error: error.message,
      });
    }
  }
}
