// src/components/Dashboard/DeviceStatus.tsx
import React from 'react';
import { Cpu, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface DeviceStatusProps {
  devices: Array<{
    id: string;
    deviceId: string;
    name: string;
    location: string;
    status: string;
    isActive: boolean;
  }>;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({ devices }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Cpu className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Device Status</h3>
      <div className="space-y-3">
        {devices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No devices found</p>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Cpu className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{device.name}</p>
                <p className="text-sm text-gray-500">
                  {device.deviceId} • {device.location || 'No location'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(device.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                  {device.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};