import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ListUserDto {
  @ApiProperty({
    example: '2021-07-01',
    description: 'The initial date of the search',
  })
  @IsOptional()
  initialDate: Date;

  @ApiProperty({
    example: '2021-07-30',
    description: 'The final date of the search',
  })
  @IsOptional()
  finalDate: Date;

  @ApiProperty({
    example: '',
    description: 'The search string',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 1,
    description: 'The page number',
  })
  @IsOptional()
  pageNumber?: number;
}
