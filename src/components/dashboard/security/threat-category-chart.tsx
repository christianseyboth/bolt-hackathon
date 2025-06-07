'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export function ThreatCategoryChart({
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
    const categoryColors: Record<string, string> = {
        Phishing: '#9333ea', // purple-600
        Malware: '#ef4444', // red-500
        Spam: '#3b82f6', // blue-500
        Scam: '#f97316', // orange-500
        Impersonation: '#06b6d4', // cyan-500
        Ransomware: '#14b8a6', // teal-500
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-neutral-800 p-3 border border-neutral-700 rounded-md shadow-lg'>
                    <p className='font-medium text-xs mb-2'>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className='flex items-center text-xs'>
                            <div
                                className='w-3 h-3 mr-2 rounded-sm'
                                style={{ backgroundColor: entry.fill }}
                            />
                            <span className='mr-2'>Count:</span>
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
                <CardTitle className='text-lg font-medium'>Threat Categories</CardTitle>
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

                    {/* ─── Weekly Chart ────────────────────────────────────────────── */}
                    <TabsContent value='weekly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={weeklyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='category' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                <Bar
                                    dataKey='count'
                                    name='Threat Count'
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    fill='#8884d8'
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                >
                                    {weeklyData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={categoryColors[entry.category] || '#8884d8'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    {/* ─── Monthly Chart ───────────────────────────────────────────── */}
                    <TabsContent value='monthly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={monthlyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='category' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                <Bar
                                    dataKey='count'
                                    name='Threat Count'
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    fill='#8884d8'
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                >
                                    {monthlyData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={categoryColors[entry.category] || '#8884d8'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    {/* ─── Yearly Chart ───────────────────────────────────────────── */}
                    <TabsContent value='yearly' className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={yearlyData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    stroke='#333'
                                    vertical={false}
                                />
                                <XAxis dataKey='category' stroke='#666' fontSize={12} />
                                <YAxis stroke='#666' fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                <Bar
                                    dataKey='count'
                                    name='Threat Count'
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    fill='#8884d8'
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                >
                                    {yearlyData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={categoryColors[entry.category] || '#8884d8'}
                                        />
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
