import {
  Controller,
  Get,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { ResponseAPI } from 'src/enums/responses.enum';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get()
  async findAll() {
    try {
      const actions = await this.actionService.findAll();
      return {
        message: ResponseAPI.ITEMS_FOUND,
        data: actions,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ResponseAPI.NOT_FOUND,
        error: error.message,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.actionService.remove(+id);
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
