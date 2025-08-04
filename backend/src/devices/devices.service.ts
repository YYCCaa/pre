// src/devices/devices.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    return this.deviceRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['events'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Device> {
    return this.deviceRepository.findOne({
      where: { id },
      relations: ['events'],
    });
  }

  async findByDeviceId(deviceId: string): Promise<Device> {
    return this.deviceRepository.findOne({
      where: { deviceId },
      relations: ['events'],
    });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    await this.deviceRepository.update(id, updateDeviceDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.deviceRepository.delete(id);
  }

  async updateStatus(deviceId: string, status: string): Promise<Device> {
    await this.deviceRepository.update({ deviceId }, { status });
    return this.findByDeviceId(deviceId);
  }
}