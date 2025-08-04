// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private eventsService: EventsService,
    private devicesService: DevicesService,
  ) {}

  async getDashboardStats() {
    const devices = await this.devicesService.findAll();
    const recentEvents = await this.eventsService.findAll(100);
    
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.status === 'online').length;
    const totalEvents = recentEvents.length;
    
    const objectTypeCounts = recentEvents.reduce((acc, event) => {
      acc[event.objectType] = (acc[event.objectType] || 0) + event.count;
      return acc;
    }, {});

    const eventTypeCounts = recentEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDevices,
      activeDevices,
      totalEvents,
      objectTypeCounts,
      eventTypeCounts,
      recentEvents: recentEvents.slice(0, 10),
    };
  }

  async getHourlyStats(hours: number = 24) {
    return this.eventsService.getEventCounts(undefined, hours);
  }
}