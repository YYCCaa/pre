// src/components/Dashboard/Dashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { StatsCards } from './StatsCards';
import { EventsChart } from './EventsChart';
import { RecentEvents } from './RecentEvents';
import { DeviceStatus } from './DeviceStatus';
import { ObjectTypeChart } from './ObjectTypeChart';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  totalEvents: number;
  objectTypeCounts: Record<string, number>;
  eventTypeCounts: Record<string, number>;
  recentEvents: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-event', handleNewEvent);
      socket.on('device-status', handleDeviceStatus);
      socket.on('analytics-update', handleAnalyticsUpdate);

      return () => {
        socket.off('new-event', handleNewEvent);
        socket.off('device-status', handleDeviceStatus);
        socket.off('analytics-update', handleAnalyticsUpdate);
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, devicesResponse, hourlyResponse] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/devices'),
        apiClient.get('/analytics/hourly'),
      ]);

      setStats(statsResponse.data);
      setDevices(devicesResponse.data);
      setHourlyData(hourlyResponse.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEvent = (event: any) => {
    setStats(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        totalEvents: prev.totalEvents + 1,
        objectTypeCounts: {
          ...prev.objectTypeCounts,
          [event.objectType]: (prev.objectTypeCounts[event.objectType] || 0) + event.count,
        },
        eventTypeCounts: {
          ...prev.eventTypeCounts,
          [event.eventType]: (prev.eventTypeCounts[event.eventType] || 0) + 1,
        },
        recentEvents: [event, ...prev.recentEvents.slice(0, 9)],
      };
    });
  };

  const handleDeviceStatus = (data: { deviceId: string; status: string }) => {
    setDevices(prev => 
      prev.map(device => 
        device.deviceId === data.deviceId 
          ? { ...device, status: data.status }
          : device
      )
    );
  };

  const handleAnalyticsUpdate = (data: any) => {
    setHourlyData(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Edge AI Tracking Dashboard</h1>
          
          {stats && (
            <>
              <StatsCards stats={stats} />
              
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EventsChart data={hourlyData} />
                <ObjectTypeChart data={stats.objectTypeCounts} />
              </div>
              
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentEvents events={stats.recentEvents} />
                <DeviceStatus devices={devices} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};








