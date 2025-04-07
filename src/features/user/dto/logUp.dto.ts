import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { ResponseAPI } from 'src/enums/responses.enum';

export class LogUpDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the user',
  })
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Reservacion333+/',
    description: 'The password of the user',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1',
    description: 'The role of the user',
  })
  @IsNotEmpty({ message: ResponseAPI.REQUIRED_ROL_ID })
  rolId: number;
}
