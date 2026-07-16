import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Sport } from '@prisma/client';

export class QueryTrainingsDto {
  @ApiPropertyOptional({ enum: Sport })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
