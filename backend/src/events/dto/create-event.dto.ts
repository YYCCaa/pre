// src/events/dto/create-event.dto.ts
import { IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';

export class CreateEventDto {
  @IsString()
  deviceId: string;

  @IsString()
  objectType: string;

  @IsString()
  eventType: string;

  @IsOptional()
  @IsObject()
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;
}