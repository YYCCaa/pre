import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let repository: Repository<Device>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    repository = module.get<Repository<Device>>(getRepositoryToken(Device));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a device', async () => {
      const createDeviceDto = {
        deviceId: 'jetson-001',
        name: 'Test Device',
        location: 'Test Location',
      };

      const mockDevice = { 
        id: '1', 
        ...createDeviceDto,
        isActive: true,
        status: 'offline',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockRepository.create.mockReturnValue(mockDevice);
      mockRepository.save.mockResolvedValue(mockDevice);

      const result = await service.create(createDeviceDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDeviceDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual(mockDevice);
    });
  });

  describe('findAll', () => {
    it('should return all devices', async () => {
      const mockDevices = [
        { 
          id: '1', 
          deviceId: 'jetson-001', 
          name: 'Device 1',
          isActive: true,
          status: 'online',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { 
          id: '2', 
          deviceId: 'jetson-002', 
          name: 'Device 2',
          isActive: true,
          status: 'offline',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockDevices);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['events'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      const deviceId = '1';
      const mockDevice = {
        id: deviceId,
        deviceId: 'jetson-001',
        name: 'Test Device',
        isActive: true,
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockDevice);

      const result = await service.findOne(deviceId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: deviceId },
        relations: ['events'],
      });
      expect(result).toEqual(mockDevice);
    });
  });

  describe('updateStatus', () => {
    it('should update device status', async () => {
      const deviceId = 'jetson-001';
      const status = 'online';
      const updatedDevice = {
        id: '1',
        deviceId,
        name: 'Test Device',
        status,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedDevice);

      const result = await service.updateStatus(deviceId, status);

      expect(mockRepository.update).toHaveBeenCalledWith({ deviceId }, { status });
      expect(result).toEqual(updatedDevice);
    });
  });
});
