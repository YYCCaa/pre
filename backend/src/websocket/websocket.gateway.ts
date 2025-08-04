// src/websocket/websocket.gateway.ts
import {
    WebSocketGateway as WSGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  
  @WSGateway({
    cors: {
      origin: '*',
    },
  })
  export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private readonly logger = new Logger(WebSocketGateway.name);
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('join-room')
    handleJoinRoom(client: Socket, room: string) {
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
    }
  
    broadcastEvent(event: any) {
      this.server.emit('new-event', event);
    }
  
    broadcastDeviceStatus(deviceId: string, status: string) {
      this.server.emit('device-status', { deviceId, status });
    }
  
    broadcastAnalytics(data: any) {
      this.server.emit('analytics-update', data);
    }
  }