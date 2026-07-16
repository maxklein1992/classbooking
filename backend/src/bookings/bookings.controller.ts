import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Book a training' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List my bookings (incl. cancelled)' })
  findMine(@CurrentUser('id') userId: string) {
    return this.bookingsService.findMine(userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancel a booking (owner only)' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.remove(id, userId);
  }
}
