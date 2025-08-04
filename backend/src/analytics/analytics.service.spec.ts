import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { EventsService } from '../events/events.service';
import { DevicesService } from '../devices/devices.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let eventsService: EventsService;
  let devicesService: DevicesService;

  const mockEventsService = {
    findAll: jest.fn(),
    getEventCounts: jest.fn(),
  };

  const mockDevicesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    eventsService = module.get<EventsService>(EventsService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockDevices = [
        { id: '1', status: 'online', isActive: true },
        { id: '2', status: 'online', isActive: true },
        { id: '3', status: 'offline', isActive: false },
      ];

      const mockEvents = [
        { 
          id: '1',
          objectType: 'person', 
          eventType: 'detection', 
          count: 1,
          timestamp: new Date(),
        },
        { 
          id: '2',
          objectType: 'person', 
          eventType: 'entry', 
          count: 2,
          timestamp: new Date(),
        },
        { 
          id: '3',
          objectType: 'vehicle', 
          eventType: 'detection', 
          count: 1,
          timestamp: new Date(),
        },
      ];

      mockDevicesService.findAll.mockResolvedValue(mockDevices);
      mockEventsService.findAll.mockResolvedValue(mockEvents);

      const result = await service.getDashboardStats();

      expect(result.totalDevices).toBe(3);
      expect(result.activeDevices).toBe(2);
      expect(result.totalEvents).toBe(3);
      expect(result.objectTypeCounts['person']).toBe(3);
expect(result.objectTypeCounts['vehicle']).toBe(1);
expect(result.eventTypeCounts['detection']).toBe(2);
expect(result.eventTypeCounts['entry']).toBe(1);
    });
  });

  describe('getHourlyStats', () => {
    it('should return hourly statistics', async () => {
      const mockHourlyData = [
        { hour: '2023-01-01 10:00:00', objectType: 'person', count: 5 },
        { hour: '2023-01-01 11:00:00', objectType: 'vehicle', count: 3 },
      ];

      mockEventsService.getEventCounts.mockResolvedValue(mockHourlyData);

      const result = await service.getHourlyStats(24);

      expect(mockEventsService.getEventCounts).toHaveBeenCalledWith(undefined, 24);
      expect(result).toEqual(mockHourlyData);
    });
  });
});
