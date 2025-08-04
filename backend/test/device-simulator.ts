// test/device-simulator.ts
import * as mqtt from 'mqtt';

interface DetectionData {
  deviceId: string;
  objectType: string;
  eventType: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  metadata: any;
  count: number;
}

export class DeviceSimulator {
  private client: mqtt.MqttClient;
  private devices: string[] = ['jetson-001', 'jetson-002', 'jetson-003'];
  private objectTypes = ['person', 'vehicle', 'bicycle', 'dog', 'cat'];
  private eventTypes = ['detection', 'entry', 'exit', 'count_update'];
  private intervalId: NodeJS.Timeout;

  constructor(brokerUrl: string = 'mqtt://localhost:1883') {
    this.client = mqtt.connect(brokerUrl, {
      clientId: `simulator-${Math.random().toString(16).substr(2, 8)}`,
    });

    this.client.on('connect', () => {
      console.log('Simulator connected to MQTT broker');
    });

    this.client.on('error', (error) => {
      console.error('MQTT client error:', error);
    });
  }

  start(intervalMs: number = 2000): void {
    console.log(`Starting device simulation with ${intervalMs}ms interval`);
    
    this.intervalId = setInterval(() => {
      this.generateRandomEvent();
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.client.end();
  }

  private generateRandomEvent(): void {
    const deviceId = this.getRandomElement(this.devices);
    const objectType = this.getRandomElement(this.objectTypes);
    const eventType = this.getRandomElement(this.eventTypes);
    
    const data: DetectionData = {
      deviceId,
      objectType,
      eventType,
      boundingBox: {
        x: Math.floor(Math.random() * 1920),
        y: Math.floor(Math.random() * 1080),
        width: Math.floor(Math.random() * 200 + 50),
        height: Math.floor(Math.random() * 300 + 100),
      },
      confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: Math.floor(Math.random() * 100 + 10),
        temperature: Math.floor(Math.random() * 20 + 60), // 60-80°C
      },
      count: Math.floor(Math.random() * 5 + 1),
    };

    const topic = `devices/${deviceId}/events`;
    this.client.publish(topic, JSON.stringify(data));
    
    console.log(`Published event: ${deviceId} - ${eventType} - ${objectType}`);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// Run simulator if called directly
if (require.main === module) {
  const simulator = new DeviceSimulator();
  simulator.start(1500); // Send event every 1.5 seconds

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down simulator...');
    simulator.stop();
    process.exit(0);
  });
}





