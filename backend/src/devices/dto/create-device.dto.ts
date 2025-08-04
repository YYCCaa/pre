// src/devices/dto/create-device.dto.ts
import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ 
    description: 'Unique identifier for the device',
    example: 'jetson-001',
    minLength: 3,
    maxLength: 50 
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  deviceId: string;

  @ApiProperty({ 
    description: 'Human-readable name for the device',
    example: 'Main Entrance Camera',
    minLength: 2,
    maxLength: 100 
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Physical location of the device',
    example: 'Building A - Main Entrance',
    maxLength: 200 
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Latitude coordinate',
    example: 40.7128,
    minimum: -90,
    maximum: 90 
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Longitude coordinate',
    example: -74.0060,
    minimum: -180,
    maximum: 180 
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Whether the device is active',
    example: true,
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Current status of the device',
    example: 'online',
    enum: ['online', 'offline', 'error'],
    default: 'offline' 
  })
  @IsOptional()
  @IsString()
  status?: string;
}