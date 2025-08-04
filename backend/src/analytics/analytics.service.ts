// src/analytics/analytics.service.ts (UPDATED - Better error handling)
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
    try {
      // Get data with proper error handling
      const [devices, recentEvents] = await Promise.all([
        this.devicesService.findAll().catch(() => []), // Return empty array on error
        this.eventsService.getRecentEventsForDashboard(100).catch(() => []), // Return empty array on error
      ]);
      
      const totalDevices = devices.length;
      const activeDevices = devices.filter(d => d.status === 'online').length;
      const totalEvents = recentEvents.length;
      
      // Safely calculate object type counts
      const objectTypeCounts = recentEvents.reduce((acc, event) => {
        const objectType = event.objectType || 'unknown';
        const count = event.count || 1;
        acc[objectType] = (acc[objectType] || 0) + count;
        return acc;
      }, {} as Record<string, number>);

      // Safely calculate event type counts
      const eventTypeCounts = recentEvents.reduce((acc, event) => {
        const eventType = event.eventType || 'unknown';
        acc[eventType] = (acc[eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalDevices,
        activeDevices,
        totalEvents,
        objectTypeCounts,
        eventTypeCounts,
        recentEvents: recentEvents.slice(0, 10), // Limit to 10 most recent
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      
      // Return safe defaults on error
      return {
        totalDevices: 0,
        activeDevices: 0,
        totalEvents: 0,
        objectTypeCounts: {},
        eventTypeCounts: {},
        recentEvents: [],
      };
    }
  }

  async getHourlyStats(hours: number = 24) {
    try {
      // Validate hours parameter
      const validHours = !isNaN(hours) && hours > 0 && hours <= 8760 ? hours : 24;
      
      return await this.eventsService.getEventCounts(undefined, validHours);
    } catch (error) {
      console.error('Error in getHourlyStats:', error);
      return []; // Return empty array on error
    }
  }

  // ADDED: Get device-specific analytics
  async getDeviceAnalytics(deviceId: string, hours: number = 24) {
    try {
      const validHours = !isNaN(hours) && hours > 0 && hours <= 8760 ? hours : 24;
      
      const [device, eventCounts] = await Promise.all([
        this.devicesService.findByDeviceId(deviceId).catch(() => null),
        this.eventsService.getEventCounts(deviceId, validHours).catch(() => []),
      ]);

      return {
        device,
        eventCounts,
        totalEvents: eventCounts.reduce((sum, item) => sum + (item.count || 0), 0),
      };
    } catch (error) {
      console.error('Error in getDeviceAnalytics:', error);
      return {
        device: null,
        eventCounts: [],
        totalEvents: 0,
      };
    }
  }
}