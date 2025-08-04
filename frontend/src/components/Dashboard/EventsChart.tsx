// src/components/Dashboard/EventsChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface EventsChartProps {
  data: Array<{
    hour: string;
    objectType: string;
    count: number;
  }>;
}

export const EventsChart: React.FC<EventsChartProps> = ({ data }) => {
  // Transform data for the chart
  const chartData = data.reduce((acc, item) => {
    const hour = format(new Date(item.hour), 'HH:mm');
    const existing = acc.find(d => d.hour === hour);
    
    if (existing) {
      existing[item.objectType] = (existing[item.objectType] || 0) + parseInt(item.count.toString());
      existing.total = (existing.total || 0) + parseInt(item.count.toString());
    } else {
      acc.push({
        hour,
        [item.objectType]: parseInt(item.count.toString()),
        total: parseInt(item.count.toString()),
      });
    }
    
    return acc;
  }, [] as any[]);

  const objectTypes = [...new Set(data.map(d => d.objectType))];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Events Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          {objectTypes.map((type, index) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};