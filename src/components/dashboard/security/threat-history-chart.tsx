'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export function ThreatHistoryChart({
    weeklyData,
    monthlyData,
    yearlyData,
}: {
    weeklyData: any[];
    monthlyData: any[];
    yearlyData: any[];
}) {
    const [tab, setTab] = useState('weekly');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('en-US', { month: 'long' });

    const weekNumber = Math.ceil(
        ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 +
            new Date(now.getFullYear(), 0, 1).getDay() +
            1) /
            7
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-neutral-800 p-3 border border-neutral-700 rounded-md shadow-lg'>
                    <p className='font-medium text-xs mb-2'>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div
                            key={`item-${index}`}
                            className='flex items-center text-xs mb-1 last:mb-0'
                        >
                            <div
                                className='w-3 h-3 mr-2 rounded-sm'
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className='mr-2'>{entry.name}:</span>
                            <span className='font-medium'>{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>Threat History Over Time</CardTitle>
                <div className='text-xs text-neutral-400 '>
                    {tab === 'weekly' && (
                        <>
                            CW {weekNumber} • {year}
                        </>
                    )}
                    {tab === 'monthly' && (
                        <>
                            {month} {year}
                        </>
                    )}
                    {tab === 'yearly' && <>{year}</>}
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue='weekly' value={tab} onValueChange={setTab}>
                    <div className='flex justify-end mb-4'>
                        <TabsList>
                            <TabsTrigger className='cursor-pointer' value='weekly'>
                                Weekly
                            </TabsTrigger>
                            <TabsTrigger className='cursor-pointer' value='monthly'>
                                Monthly
                            </TabsTrigger>
                            <TabsTrigger className='cursor-pointer' value='yearly'>
                                Yearly
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value='weekly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                                data={weeklyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='name' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='critical'
                                    stroke='#ef4444'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Critical'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='high'
                                    stroke='#f97316'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='High'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='medium'
                                    stroke='#eab308'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Medium'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='low'
                                    stroke='#06b6d4'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Low'
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value='monthly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                                data={monthlyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='name' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='critical'
                                    stroke='#ef4444'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Critical'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='high'
                                    stroke='#f97316'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='High'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='medium'
                                    stroke='#eab308'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Medium'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='low'
                                    stroke='#06b6d4'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Low'
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value='yearly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                                data={yearlyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='name' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='critical'
                                    stroke='#ef4444'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Critical'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='high'
                                    stroke='#f97316'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='High'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='medium'
                                    stroke='#eab308'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Medium'
                                />
                                <Line
                                    type='monotone'
                                    dataKey='low'
                                    stroke='#06b6d4'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name='Low'
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
