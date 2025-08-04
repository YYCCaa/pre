// src/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics including device counts, event counts, and recent events',
    schema: {
      type: 'object',
      properties: {
        totalDevices: { type: 'number', example: 5 },
        activeDevices: { type: 'number', example: 3 },
        totalEvents: { type: 'number', example: 1250 },
        objectTypeCounts: { 
          type: 'object',
          example: { person: 800, vehicle: 300, bicycle: 150 }
        },
        eventTypeCounts: {
          type: 'object', 
          example: { detection: 1000, entry: 150, exit: 100 }
        },
        recentEvents: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('hourly')
  @ApiOperation({ summary: 'Get hourly event statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hourly event statistics for the specified time period',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hour: { type: 'string', example: '2024-01-15T14:00:00Z' },
          objectType: { type: 'string', example: 'person' },
          count: { type: 'number', example: 25 }
        }
      }
    }
  })
  @ApiQuery({ 
    name: 'hours', 
    required: false, 
    type: 'number', 
    description: 'Number of hours to look back (default: 24)',
    example: 24 
  })
  getHourlyStats(@Query('hours') hours?: number) {
    return this.analyticsService.getHourlyStats(hours);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get analytics for a specific device' })
  @ApiResponse({ 
    status: 200, 
    description: 'Device-specific analytics' 
  })
  @ApiQuery({ 
    name: 'hours', 
    required: false, 
    type: 'number', 
    description: 'Number of hours to analyze (default: 24)' 
  })
  getDeviceAnalytics(
    @Query('deviceId') deviceId: string,
    @Query('hours') hours?: number,
  ) {
    // This would be implemented in the analytics service
    return {
      deviceId,
      message: 'Device-specific analytics endpoint',
      hours: hours || 24,
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trending data and patterns' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending patterns and insights' 
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['hour', 'day', 'week', 'month'],
    description: 'Time period for trend analysis (default: day)' 
  })
  getTrends(@Query('period') period?: string) {
    return {
      period: period || 'day',
      message: 'Trends analysis endpoint',
      // This would return actual trend data
    };
  }
}