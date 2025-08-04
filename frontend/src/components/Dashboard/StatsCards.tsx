// src/components/Dashboard/StatsCards.tsx
import React from 'react';
import { Activity, Cpu, Eye, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalDevices: number;
    activeDevices: number;
    totalEvents: number;
    objectTypeCounts: Record<string, number>;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const totalObjects = Object.values(stats.objectTypeCounts).reduce((sum, count) => sum + count, 0);

  const cards = [
    {
      title: 'Total Devices',
      value: stats.totalDevices,
      icon: Cpu,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Devices',
      value: stats.activeDevices,
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Eye,
      color: 'bg-purple-500',
    },
    {
      title: 'Objects Detected',
      value: totalObjects,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white overflow-hidden rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};