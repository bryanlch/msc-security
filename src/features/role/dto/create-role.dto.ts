import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Action } from './action.class';

export class CreateRoleDto {
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
  status: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    example: 1,
    description: 'The role id',
  })
  @IsOptional()
  permissions: Action[];
}

export enum RolesStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface QueryRole {
  where: { id: number; status?: RolesStatus };
  select: { id: boolean; name: boolean; status: boolean };
  cache: boolean;
}
