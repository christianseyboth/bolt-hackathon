"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function ThreatCategoryChart() {
  // Mock data for threat categories
  const weeklyData = [
    { category: "Phishing", count: 48 },
    { category: "Malware", count: 32 },
    { category: "Spam", count: 67 },
    { category: "Scam", count: 27 },
    { category: "Impersonation", count: 15 },
    { category: "Ransomware", count: 7 },
  ];

  const monthlyData = [
    { category: "Phishing", count: 156 },
    { category: "Malware", count: 98 },
    { category: "Spam", count: 237 },
    { category: "Scam", count: 89 },
    { category: "Impersonation", count: 45 },
    { category: "Ransomware", count: 21 },
  ];

  // Color mapping for different categories
  const categoryColors: Record<string, string> = {
    Phishing: "#9333ea", // purple-600
    Malware: "#ef4444", // red-500
    Spam: "#3b82f6", // blue-500
    Scam: "#f97316", // orange-500
    Impersonation: "#06b6d4", // cyan-500
    Ransomware: "#14b8a6", // teal-500
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 p-3 border border-neutral-700 rounded-md shadow-lg">
          <p className="font-medium text-xs mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center text-xs">
              <div
                className="w-3 h-3 mr-2 rounded-sm"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="mr-2">Count:</span>
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
        <CardTitle className="text-lg font-medium">Threat Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="category" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Threat Count"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  fill="#8884d8"
                  // Use different colors for each bar based on category
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {weeklyData.map((entry, index) => (
                    <Bar key={index} fill={categoryColors[entry.category] || "#8884d8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="category" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Threat Count" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {monthlyData.map((entry, index) => (
                    <Bar key={index} fill={categoryColors[entry.category] || "#8884d8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}