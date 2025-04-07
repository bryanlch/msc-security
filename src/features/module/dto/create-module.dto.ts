import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    example: 'Module name',
    description: 'The name of the module',
  })
  @IsNotEmpty()
  module: IModule;

  @ApiProperty({
    example: 'READ',
    description: 'The actions of the module',
  })
  @IsNotEmpty()
  actions: IAction[];
}

interface IModule {
  name: string;
  description: string;
  path: string;
  parentId: number;
}

interface IAction {
  action: 'READ' | 'WRITE' | 'DELETE';
}
