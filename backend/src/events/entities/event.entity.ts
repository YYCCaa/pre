// src/events/entities/event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column()
  objectType: string; // person, vehicle, animal, etc.

  @Column()
  eventType: string; // detection, entry, exit, count_update

  @Column({ type: 'jsonb', nullable: true })
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidence: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: 1 })
  count: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Device, device => device.events)
  @JoinColumn({ name: 'deviceId', referencedColumnName: 'deviceId' })
  device: Device;
}