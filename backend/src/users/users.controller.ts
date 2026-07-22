import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { toPublicUser } from './user.serializer';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Set or replace the current user profile photo' })
  async setAvatar(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvatarDto,
  ) {
    const user = await this.usersService.updateAvatar(userId, dto.avatarUrl);
    return toPublicUser(user);
  }

  @Delete('me/avatar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove the current user profile photo' })
  async removeAvatar(@CurrentUser('id') userId: string) {
    const user = await this.usersService.updateAvatar(userId, null);
    return toPublicUser(user);
  }
}
