import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-training' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  trainingId: string;
}
