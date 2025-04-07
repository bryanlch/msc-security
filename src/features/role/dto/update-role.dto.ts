import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Action } from './action.class';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Admin',
    description: 'The role name',
  })
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    example: true,
    description: 'The role status',
  })
  @IsNotEmpty()
  status?: boolean;

  @ApiProperty({
    example: 1,
    description: 'The permissions id',
  })
  @IsOptional()
  permissions?: Action[];
}
