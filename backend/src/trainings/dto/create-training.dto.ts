import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Level, Sport } from '@prisma/client';

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

  @ApiPropertyOptional({
    enum: Level,
    example: Level.BEGINNER,
    description: 'Niveau van de training. Laat leeg voor "alle niveaus".',
  })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

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

  @ApiProperty({ example: 'Amsterdam' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'Noord' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: '1031 KN' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 10.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Biedt deze training een gratis proefles aan?',
  })
  @IsOptional()
  @IsBoolean()
  freeTrialAvailable?: boolean;
}
