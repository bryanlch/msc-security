import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateModuleDto {
     @ApiProperty({
          example: 'Module name',
          description: 'The name of the module',
     })
     @IsNotEmpty()
     module: IModule;

     @ApiProperty({
          example: 'Module description',
          description: 'The description of the module',
     })
     @IsNotEmpty()
     actions: [IActions];
}

interface IModule {
     name: string;
     description: string;
     path: string;
}

interface IActions {
     action: 'READ' | 'WRITE' | 'DELETE';
}

