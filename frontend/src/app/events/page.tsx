// src/app/events/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/Layout/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { format } from 'date-fns';
import { Eye, ArrowRight, ArrowLeft, BarChart3, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  deviceId: string;
  objectType: string;
  eventType: string;
  confidence: number;
  count: number;
  timestamp: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: any;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    deviceId: '',
    eventType: '',
    objectType: '',
  });
  const socket = useSocket();

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  useEffect(() => {
    if (socket) {
      socket.on('new-event', handleNewEvent);
      return () => {
        socket.off('new-event', handleNewEvent);
      };
    }
  }, [socket]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.objectType) params.append('objectType', filters.objectType);

      const response = await apiClient.get(`/events?${params.toString()}`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Events fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEvent = (event: Event) => {
    setEvents(prev => [event, ...prev]);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'detection':
        return <Eye className="h-4 w-4" />;
      case 'entry':
        return <ArrowRight className="h-4 w-4" />;
      case 'exit':
        return <ArrowLeft className="h-4 w-4" />;
      case 'count_update':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'detection':
        return 'bg-blue-100 text-blue-800';
      case 'entry':
        return 'bg-green-100 text-green-800';
      case 'exit':
        return 'bg-red-100 text-red-800';
      case 'count_update':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filters.eventType}
                    onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">All Event Types</option>
                    <option value="detection">Detection</option>
                    <option value="entry">Entry</option>
                    <option value="exit">Exit</option>
                    <option value="count_update">Count Update</option>
                  </select>
                  <select
                    value={filters.objectType}
                    onChange={(e) => setFilters(prev => ({ ...prev, objectType: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">All Object Types</option>
                    <option value="person">Person</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No events found matching your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-full ${getEventColor(event.eventType)}`}>
                                {getEventIcon(event.eventType)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {event.objectType} {event.eventType}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {event.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.deviceId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Count: {event.count} • 
                            Confidence: {(event.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}