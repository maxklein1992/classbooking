import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Level, Sport } from '@prisma/client';

export const MAX_TRAINING_PHOTOS = 8;

// Zelfde patroon als bij de profielfoto van een gebruiker (zie
// users/dto/update-avatar.dto.ts): een gewone http(s)-URL, of een data-URL
// met een toegestaan beeldtype (jpeg/jpg, png, webp). Elke foto is begrensd
// op ~4MB base64 en het aantal foto's per training is begrensd, zodat de
// payload beheersbaar blijft; de frontend valideert grootte/type vooraf.
const TRAINING_PHOTO_PATTERN =
  /^(https?:\/\/.+|data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+)$/;

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

  @ApiPropertyOptional({
    type: [String],
    description: `Foto's van de training (max ${MAX_TRAINING_PHOTOS}), als http(s)-URL of data-URL (image/png, image/jpeg of image/webp). De volgorde bepaalt de volgorde in de carrousel.`,
    example: ['data:image/png;base64,iVBORw0KGgo...'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TRAINING_PHOTOS, {
    message: `Je kunt maximaal ${MAX_TRAINING_PHOTOS} foto's toevoegen.`,
  })
  @MaxLength(5_500_000, {
    each: true,
    message: 'Een van de foto\'s is te groot.',
  })
  @Matches(TRAINING_PHOTO_PATTERN, {
    each: true,
    message: 'Ongeldige foto: gebruik een jpg-, png- of webp-bestand.',
  })
  photos?: string[];
}
