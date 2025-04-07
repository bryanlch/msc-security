import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { Repository } from 'typeorm';
import { ResponseAPI } from 'src/enums/responses.enum';

@Injectable()
export class ActionService {
  constructor(
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
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
}
