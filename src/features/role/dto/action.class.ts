import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Action {
  @ApiProperty({
    example: 1,
    description: 'The action id',
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'The module id',
  })
  @IsNotEmpty()
  moduleId: number;
}
