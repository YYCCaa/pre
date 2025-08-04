// src/events/events.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  async findAll(
    limit: number = 100,
    offset: number = 0,
    deviceId?: string,
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Event[]> {
    const query = this.eventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.device', 'device')
      .orderBy('event.timestamp', 'DESC')
      .limit(limit)
      .offset(offset);

    if (deviceId) {
      query.andWhere('event.deviceId = :deviceId', { deviceId });
    }

    if (eventType) {
      query.andWhere('event.eventType = :eventType', { eventType });
    }

    if (startDate && endDate) {
      query.andWhere('event.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Event> {
    return this.eventRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }

  async getEventCounts(deviceId?: string, hours: number = 24): Promise<any[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const query = this.eventRepository.createQueryBuilder('event')
      .select([
        'DATE_TRUNC(\'hour\', event.timestamp) as hour',
        'event.objectType as objectType',
        'COUNT(*) as count',
      ])
      .where('event.timestamp >= :startDate', { startDate })
      .groupBy('DATE_TRUNC(\'hour\', event.timestamp), event.objectType')
      .orderBy('hour', 'ASC');

    if (deviceId) {
      query.andWhere('event.deviceId = :deviceId', { deviceId });
    }

    return query.getRawMany();
  }
}