import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  Matches,
  Max,
  Min,
} from 'class-validator';

// HH:mm, bijv. "09:00" of "18:30".
const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Herhaalregel voor het aanmaken van een reeks trainingssessies. Elke sessie
// wordt een gewone, los boekbare Training-rij (zie TrainingsService), maar ze
// delen deze regel (dagen van de week + tijdstip + actieve periode).
export class CreateRecurrenceDto {
  @ApiProperty({
    type: [Number],
    example: [1, 3, 5],
    description: 'Dagen van de week waarop de training plaatsvindt (0=zondag .. 6=zaterdag)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @ApiProperty({ example: '18:00', description: 'Starttijd per sessie (HH:mm)' })
  @Matches(TIME_OF_DAY_PATTERN, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: '19:00', description: 'Eindtijd per sessie (HH:mm)' })
  @Matches(TIME_OF_DAY_PATTERN, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiProperty({
    example: '2026-08-01',
    description: 'Vanaf welke datum sessies gegenereerd worden',
  })
  @IsDateString()
  activeFrom: string;

  @ApiProperty({
    example: '2026-10-01',
    description: 'Tot en met welke datum sessies gegenereerd worden',
  })
  @IsDateString()
  activeUntil: string;
}
