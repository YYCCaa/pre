
// src/components/Dashboard/RecentEvents.tsx
import React from 'react';
import { format } from 'date-fns';
import { Eye, ArrowRight, ArrowLeft, BarChart3 } from 'lucide-react';

interface RecentEventsProps {
  events: Array<{
    id: string;
    deviceId: string;
    objectType: string;
    eventType: string;
    confidence: number;
    count: number;
    timestamp: string;
  }>;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({ events }) => {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent events</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${getEventColor(event.eventType)}`}>
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {event.objectType} {event.eventType}
                </p>
                <p className="text-sm text-gray-500">
                  Device: {event.deviceId} • Count: {event.count} • 
                  Confidence: {(event.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(event.timestamp), 'HH:mm:ss')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};