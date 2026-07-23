import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Sport } from '@prisma/client';
import { CreateRecurrenceDto } from './create-recurrence.dto';

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
    example: '2026-08-01T18:00:00.000Z',
    description: 'Verplicht tenzij `recurrence` is opgegeven (eenmalige training).',
  })
  @ValidateIf((o: CreateTrainingDto) => !o.recurrence)
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    example: '2026-08-01T19:00:00.000Z',
    description: 'Verplicht tenzij `recurrence` is opgegeven (eenmalige training).',
  })
  @ValidateIf((o: CreateTrainingDto) => !o.recurrence)
  @IsDateString()
  endTime?: string;

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

  @ApiPropertyOptional({
    type: CreateRecurrenceDto,
    description:
      'Optioneel: maak een herhalende training. Als dit is opgegeven worden startTime/endTime genegeerd en genereert de backend losse, individueel boekbare sessies volgens deze regel.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecurrenceDto)
  recurrence?: CreateRecurrenceDto;
}
