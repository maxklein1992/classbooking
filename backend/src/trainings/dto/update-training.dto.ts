import {
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { CreateTrainingDto } from './create-training.dto';

export class UpdateTrainingDto extends PartialType(
  OmitType(CreateTrainingDto, ['teacherId'] as const),
) {
  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description:
      'Id van de teacher, of null om de teacher te wissen (de aanmaker ' +
      'wordt dan weer de impliciete teacher).',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  teacherId?: string | null;
}
