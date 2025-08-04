import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getDashboardStats: jest.fn(),
    getHourlyStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const expectedResult = {
        totalDevices: 5,
        activeDevices: 3,
        totalEvents: 100,
        objectTypeCounts: { person: 60, vehicle: 40 },
        eventTypeCounts: { detection: 80, entry: 20 },
        recentEvents: [],
      };

      mockAnalyticsService.getDashboardStats.mockResolvedValue(expectedResult);

      const result = await controller.getDashboardStats();

      expect(service.getDashboardStats).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
