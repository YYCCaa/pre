import { Controller, Get, Post, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('deviceId') deviceId?: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Parse and validate query parameters
    const parsedLimit = limit ? parseInt(limit) : 100;
    const parsedOffset = offset ? parseInt(offset) : 0;
    
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    // Safely parse dates
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new BadRequestException('Invalid startDate format');
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid endDate format');
      }
    }

    // Validate limit and offset
    if (isNaN(parsedLimit) || parsedLimit < 0 || parsedLimit > 1000) {
      throw new BadRequestException('Limit must be between 0 and 1000');
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw new BadRequestException('Offset must be non-negative');
    }

    return this.eventsService.findAll(
      parsedLimit,
      parsedOffset,
      deviceId,
      eventType,
      parsedStartDate,
      parsedEndDate,
    );
  }

  @Get('counts')
  async getEventCounts(
    @Query('deviceId') deviceId?: string,
    @Query('hours') hours?: string,
  ) {
    // Parse and validate hours parameter
    let parsedHours = 24; // default
    
    if (hours) {
      parsedHours = parseInt(hours);
      
      // Validate hours parameter
      if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 8760) { // max 1 year
        throw new BadRequestException('Hours must be a positive number between 1 and 8760');
      }
    }

    try {
      return await this.eventsService.getEventCounts(deviceId, parsedHours);
    } catch (error) {
      console.error('Error getting event counts:', error);
      throw new BadRequestException('Failed to get event counts');
    }
  }

  @Get('recent')
  async getRecentEvents(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.eventsService.getRecentEventsForDashboard(parsedLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}