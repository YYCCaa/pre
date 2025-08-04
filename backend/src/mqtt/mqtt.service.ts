// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { EventsService } from '../events/events.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private configService: ConfigService,
    private eventsService: EventsService,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async onModuleInit() {
    const brokerUrl = this.configService.get('MQTT_BROKER_URL', 'mqtt://localhost:1883');
    
    this.client = mqtt.connect(brokerUrl, {
      clientId: `backend-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 30000,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.client.subscribe('devices/+/events', (err) => {
        if (err) {
          this.logger.error('Failed to subscribe to device events', err);
        } else {
          this.logger.log('Subscribed to device events');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        await this.handleDeviceEvent(topic, data);
      } catch (error) {
        this.logger.error('Error processing MQTT message', error);
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT client error', error);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  private async handleDeviceEvent(topic: string, data: any) {
    // Extract device ID from topic: devices/{deviceId}/events
    const deviceId = topic.split('/')[1];
    
    const event = {
      deviceId,
      objectType: data.objectType,
      eventType: data.eventType,
      boundingBox: data.boundingBox,
      confidence: data.confidence,
      metadata: data.metadata,
      count: data.count || 1,
    };

    // Save to database
    const savedEvent = await this.eventsService.create(event);
    
    // Broadcast to WebSocket clients
    this.webSocketGateway.broadcastEvent(savedEvent);
    
    this.logger.log(`Processed event from device ${deviceId}: ${data.eventType}`);
  }

  publish(topic: string, message: any): void {
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }
}