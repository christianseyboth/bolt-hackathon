"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const mockData = [
  { name: "Mon", scanned: 40, threats: 4 },
  { name: "Tue", scanned: 55, threats: 6 },
  { name: "Wed", scanned: 68, threats: 9 },
  { name: "Thu", scanned: 42, threats: 3 },
  { name: "Fri", scanned: 59, threats: 5 },
  { name: "Sat", scanned: 25, threats: 1 },
  { name: "Sun", scanned: 18, threats: 0 },
];

const weeklyData = mockData;

const monthlyData = [
  { name: "Week 1", scanned: 245, threats: 18 },
  { name: "Week 2", scanned: 289, threats: 22 },
  { name: "Week 3", scanned: 254, threats: 15 },
  { name: "Week 4", scanned: 302, threats: 28 },
];

export function EmailAnalytics() {
  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Email Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">307</div>
              <div className="text-xs text-neutral-400">
                Emails scanned this week
              </div>
            </div>
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1c1c",
                      border: "1px solid #333",
                      borderRadius: "4px",
                    }}
                    itemStyle={{ color: "#f1f1f1" }}
                  />
                  <Bar
                    dataKey="scanned"
                    fill="rgba(6, 182, 212, 0.6)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    dataKey="threats"
                    fill="rgba(220, 38, 38, 0.6)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-cyan-500 opacity-60 rounded-sm mr-1"></div>
                <span>Emails Scanned</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 opacity-60 rounded-sm mr-1"></div>
                <span>Threats Detected</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1c1c",
                      border: "1px solid #333",
                      borderRadius: "4px",
                    }}
                    itemStyle={{ color: "#f1f1f1" }}
                  />
                  <Bar
                    dataKey="scanned"
                    fill="rgba(6, 182, 212, 0.6)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    dataKey="threats"
                    fill="rgba(220, 38, 38, 0.6)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-cyan-500 opacity-60 rounded-sm mr-1"></div>
                <span>Emails Scanned</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 opacity-60 rounded-sm mr-1"></div>
                <span>Threats Detected</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}