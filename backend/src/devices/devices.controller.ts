// src/devices/devices.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, description: 'Device created successfully' })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'List of all devices' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, description: 'Device found' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get device by device ID' })
  @ApiResponse({ status: 200, description: 'Device found' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  findByDeviceId(@Param('deviceId') deviceId: string) {
    return this.devicesService.findByDeviceId(deviceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Patch('device/:deviceId/status')
  @ApiOperation({ summary: 'Update device status' })
  @ApiResponse({ status: 200, description: 'Device status updated' })
  updateStatus(
    @Param('deviceId') deviceId: string,
    @Query('status') status: string,
  ) {
    return this.devicesService.updateStatus(deviceId, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device' })
  @ApiResponse({ status: 200, description: 'Device deleted successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }
}




