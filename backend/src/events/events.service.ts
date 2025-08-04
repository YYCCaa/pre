// src/events/events.service.ts (FIXED - Proper date handling)
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

    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
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
    // FIXED: Proper date calculation with validation
    const startDate = new Date();
    
    // Validate hours parameter
    const validHours = !isNaN(hours) && hours > 0 ? hours : 24;
    
    // Calculate start date by subtracting hours
    startDate.setHours(startDate.getHours() - validHours);
    
    // Validate the calculated date
    if (isNaN(startDate.getTime())) {
      // If date calculation failed, use a safe default (24 hours ago)
      const fallbackDate = new Date();
      fallbackDate.setHours(fallbackDate.getHours() - 24);
      startDate.setTime(fallbackDate.getTime());
    }

    const query = this.eventRepository.createQueryBuilder('event')
      .select([
        'DATE_TRUNC(\'hour\', event.timestamp) as hour',
        'event.objectType as "objectType"',
        'COUNT(*) as count',
      ])
      .where('event.timestamp >= :startDate', { startDate })
      .groupBy('DATE_TRUNC(\'hour\', event.timestamp), event.objectType')
      .orderBy('hour', 'ASC');

    if (deviceId) {
      query.andWhere('event.deviceId = :deviceId', { deviceId });
    }

    try {
      const results = await query.getRawMany();
      
      // Transform results to ensure proper data types
      return results.map(result => ({
        hour: result.hour,
        objectType: result.objectType || 'unknown',
        count: parseInt(result.count) || 0,
      }));
    } catch (error) {
      console.error('Error in getEventCounts:', error);
      // Return empty array if query fails
      return [];
    }
  }
  
  // ADDED: Helper method to get events for dashboard with better error handling
  async getRecentEventsForDashboard(limit: number = 10): Promise<Event[]> {
    try {
      return await this.eventRepository.find({
        relations: ['device'],
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting recent events:', error);
      return [];
    }
  }

  // ADDED: Get events with proper date range validation
  async getEventsByDateRange(startDate: Date, endDate: Date, deviceId?: string): Promise<Event[]> {
    // Validate dates
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date range provided');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const query = this.eventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.device', 'device')
      .where('event.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('event.timestamp', 'DESC');

    if (deviceId) {
      query.andWhere('event.deviceId = :deviceId', { deviceId });
    }

    return query.getMany();
  }
}