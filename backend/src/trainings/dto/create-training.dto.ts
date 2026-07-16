import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Sport } from '@prisma/client';

export class CreateTrainingDto {
  @ApiProperty({ example: 'Boksles voor beginners' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Techniek en conditie' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Sport, example: Sport.BOXING })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ example: '2026-08-01T18:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-08-01T19:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 'Sporthal Noord' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 10.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}
