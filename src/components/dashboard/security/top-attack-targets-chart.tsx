"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
} from "recharts";

export function TopAttackTargetsChart() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // Mock data for top attack targets
  const data = [
    { name: "john.doe@company.com", value: 42 },
    { name: "finance@company.com", value: 38 },
    { name: "hr@company.com", value: 25 },
    { name: "support@company.com", value: 21 },
    { name: "sales@company.com", value: 18 },
    { name: "admin@company.com", value: 15 },
    { name: "marketing@company.com", value: 12 },
    { name: "info@company.com", value: 10 },
    { name: "ceo@company.com", value: 9 },
    { name: "developers@company.com", value: 7 },
  ];

  // Colors for the pie chart
  const COLORS = [
    "#9333ea", "#ef4444", "#3b82f6", "#f97316", "#06b6d4", 
    "#14b8a6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 p-3 border border-neutral-700 rounded-md shadow-lg">
          <p className="font-medium text-xs mb-2">{payload[0].name}</p>
          <div className="flex items-center text-xs">
            <span className="mr-2">Attacks:</span>
            <span className="font-medium">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff" className="text-xs font-medium">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="text-xs">{`${value} attacks`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Top Attack Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pie" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Attack Count" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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