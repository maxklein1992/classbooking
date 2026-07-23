import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';

export class UpdateTeamMembersDto {
  @ApiProperty({
    description:
      'Volledige lijst met teamledennamen van de trainer. Vervangt de bestaande lijst.',
    example: ['Rui Tavares', 'Marta Nunes'],
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  teamMembers!: string[];
}
