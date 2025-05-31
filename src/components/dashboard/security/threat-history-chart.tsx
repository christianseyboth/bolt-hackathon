"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function ThreatHistoryChart() {
  // Mock data for threat history
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10) + 3,
      medium: Math.floor(Math.random() * 15) + 5,
      low: Math.floor(Math.random() * 20) + 10,
    }));
  };

  const generateMonthlyData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10) + 3,
      medium: Math.floor(Math.random() * 15) + 5,
      low: Math.floor(Math.random() * 20) + 10,
    }));
  };

  const generateQuarterlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      name: month,
      critical: Math.floor(Math.random() * 50) + 10,
      high: Math.floor(Math.random() * 100) + 30,
      medium: Math.floor(Math.random() * 150) + 50,
      low: Math.floor(Math.random() * 200) + 100,
    }));
  };

  const weeklyData = React.useMemo(() => generateWeeklyData(), []);
  const monthlyData = React.useMemo(() => generateMonthlyData(), []);
  const quarterlyData = React.useMemo(() => generateQuarterlyData(), []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 p-3 border border-neutral-700 rounded-md shadow-lg">
          <p className="font-medium text-xs mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center text-xs mb-1 last:mb-0">
              <div
                className="w-3 h-3 mr-2 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-2">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Threat History Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Critical"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Critical"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="quarterly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={quarterlyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Critical"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}