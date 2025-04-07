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
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ResponseAPI } from 'src/enums/responses.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Response } from 'express';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @ApiOperation({
    summary: 'Create module',
    description: 'Create a new module',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        module: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto, @Res() res: Response) {
    try {
      const newModule = await this.moduleService.create(createModuleDto);

      res.status(201).send({
        message: ResponseAPI.CREATE_SUCCESSFUL,
        module: newModule,
      });
    } catch (err) {
      throw new InternalServerErrorException({
        message: ResponseAPI.ERROR_CREATE_MODULE,
        error: err.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get all modules',
    description: 'Get all modules',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        modules: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    try {
      const modules = await this.moduleService.findAll();
      return {
        message: ResponseAPI.ITEMS_FOUND,
        modules,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: err.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get all modules',
    description: 'Get all modules',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        modules: [],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('list')
  async findAllList() {
    try {
      const list = await this.moduleService.findAllList();
      return {
        message: ResponseAPI.MODULE_LIST,
        list,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: ResponseAPI.MODULE_ERROR_LIST,
        error: err.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get module by id',
    description: 'Get module by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        module: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const module = await this.moduleService.findOne(+id);

      if (!module) {
        return {
          message: ResponseAPI.ITEM_NOT_FOUND,
          module,
        };
      }

      return {
        message: ResponseAPI.ITEM_FOUND,
        module,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Update module',
    description: 'Update module by id',
  })
  @ApiOkResponse({
    description: 'Successful response',
    schema: {
      example: {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        module: {},
      },
    },
  })
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<{ message: string; module: any }> {
    try {
      const moduleUpdate = await this.moduleService.update(
        +id,
        updateModuleDto,
      );
      return {
        message: ResponseAPI.UPDATE_SUCCESSFUL,
        module: moduleUpdate,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Delete module',
    description: 'Delete module by id',
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
      await this.moduleService.remove(+id);
      return {
        message: ResponseAPI.DELETED_SUCCESSFUL,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }
}
