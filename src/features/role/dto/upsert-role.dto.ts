import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Action } from './action.class';

export class UpsertRoleDto {
  @ApiProperty({
    example: 1,
    description: 'Id the role',
  })
  @IsOptional()
  id: number;

  @ApiProperty({
    example: 'Admin',
    description: 'The role name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: true,
    description: 'The role status',
  })
  @IsNotEmpty({
    message: 'El estado es requerido',
  })
  status: boolean;

  @ApiProperty({
    example: 1,
    description: 'The role id',
  })
  @IsOptional()
  permissions: Action[];
}
