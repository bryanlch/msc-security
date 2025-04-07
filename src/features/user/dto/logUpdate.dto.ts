import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ResponseAPI } from 'src/enums/responses.enum';

export class LogUpdateDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the user',
  })
  @IsOptional()
  id?: string

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

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'The email of the user',
  })
  @IsOptional()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The password of the user',
  })
  @IsOptional()
  password: string;

}
