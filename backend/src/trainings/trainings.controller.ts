import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { QueryTrainingsDto } from './dto/query-trainings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  @ApiOperation({ summary: 'List trainings (public)' })
  findAll(@Query() query: QueryTrainingsDto) {
    return this.trainingsService.findAll(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List trainings owned by the current trainer' })
  findMine(@CurrentUser('id') trainerId: string) {
    return this.trainingsService.findMine(trainerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single training (public)' })
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a training (trainer only)' })
  create(
    @CurrentUser('id') trainerId: string,
    @Body() dto: CreateTrainingDto,
  ) {
    return this.trainingsService.create(trainerId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a training (owner trainer only)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') trainerId: string,
    @Body() dto: UpdateTrainingDto,
  ) {
    return this.trainingsService.update(id, trainerId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a training (owner trainer only)' })
  remove(@Param('id') id: string, @CurrentUser('id') trainerId: string) {
    return this.trainingsService.remove(id, trainerId);
  }
}
