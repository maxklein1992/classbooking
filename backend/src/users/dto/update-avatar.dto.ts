import { ApiProperty } from '@nestjs/swagger';
import { Matches, MaxLength } from 'class-validator';

// Sta een gewone http(s)-URL toe, of een data-URL met een toegestaan
// beeldtype (jpeg/jpg, png, webp). De lengte is begrensd (~4MB base64) zodat
// de payload beheersbaar blijft; de frontend valideert grootte/type vooraf.
const AVATAR_PATTERN =
  /^(https?:\/\/.+|data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+)$/;

export class UpdateAvatarDto {
  @ApiProperty({
    description:
      'Profielfoto als http(s)-URL of als data-URL (image/png, image/jpeg of image/webp).',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  @MaxLength(5_500_000, { message: 'De afbeelding is te groot.' })
  @Matches(AVATAR_PATTERN, {
    message: 'Ongeldige afbeelding: gebruik een jpg-, png- of webp-bestand.',
  })
  avatarUrl!: string;
}
