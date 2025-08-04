// src/mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { EventsModule } from '../events/events.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [EventsModule, WebSocketModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}





