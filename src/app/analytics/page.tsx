'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CalorieLog } from '@/lib/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import { bn } from 'date-fns/locale';

type TimeRange = 'day' | 'week' | 'month';

const chartConfig = {
  calories: {
    label: 'ক্যালোরি',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [logs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const chartData = useMemo(() => {
    const now = new Date();
    if (!isClient) return [];

    switch (timeRange) {
      case 'day': {
        const interval = { start: subDays(now, 6), end: now };
        const dailyLogs = eachDayOfInterval(interval).map((day) => {
          const dayStart = startOfDay(day);
          const total = logs
            .filter((log) => startOfDay(new Date(log.date)).getTime() === dayStart.getTime())
            .reduce((sum, log) => sum + log.total_calories, 0);
          return { date: format(day, 'MMM d', { locale: bn }), calories: total };
        });
        return dailyLogs;
      }
      case 'week': {
        const interval = { start: subWeeks(now, 7), end: now };
        const weeklyLogs = eachWeekOfInterval(interval, { weekStartsOn: 1 }).map((week) => {
           const weekStart = startOfWeek(week, { weekStartsOn: 1 });
           const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
           const total = logs
            .filter((log) => {
              const logDate = new Date(log.date);
              return logDate >= weekStart && logDate <= weekEnd;
            })
            .reduce((sum, log) => sum + log.total_calories, 0);
          return { date: format(weekStart, 'MMM d', { locale: bn }), calories: total };
        });
        return weeklyLogs;
      }
      case 'month': {
        const interval = { start: subMonths(now, 11), end: now };
        const monthlyLogs = eachMonthOfInterval(interval).map((month) => {
          const monthStart = startOfMonth(month);
          const total = logs
            .filter((log) => startOfMonth(new Date(log.date)).getTime() === monthStart.getTime())
            .reduce((sum, log) => sum + log.total_calories, 0);
          return { date: format(monthStart, 'MMM yyyy', { locale: bn }), calories: total };
        });
        return monthlyLogs;
      }
      default:
        return [];
    }
  }, [logs, timeRange, isClient]);

  const totalCaloriesThisPeriod = useMemo(() => {
    if (!isClient) return 0;
    const now = new Date();
    let startDate: Date;
    switch(timeRange) {
      case 'day': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'month': startDate = startOfMonth(now); break;
    }
    return logs
      .filter(log => new Date(log.date) >= startDate)
      .reduce((sum, log) => sum + log.total_calories, 0);
  }, [logs, timeRange, isClient]);

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">বিশ্লেষণ</h1>
          <p className="text-muted-foreground">আপনার ক্যালোরি গ্রহণের একটি সংক্ষিপ্ত চিত্র।</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ক্যালোরি গ্রহণ</CardTitle>
           <CardDescription>
            {
              {
                day: `আজ মোট: ${totalCaloriesThisPeriod.toLocaleString('bn-BD')} ক্যালোরি`,
                week: `এই সপ্তাহে মোট: ${totalCaloriesThisPeriod.toLocaleString('bn-BD')} ক্যালোরি`,
                month: `এই মাসে মোট: ${totalCaloriesThisPeriod.toLocaleString('bn-BD')} ক্যালোরি`,
              }[timeRange]
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <TabsList className="mb-4">
              <TabsTrigger value="day">গত ৭ দিন</TabsTrigger>
              <TabsTrigger value="week">গত ৮ সপ্তাহ</TabsTrigger>
              <TabsTrigger value="month">গত ১২ মাস</TabsTrigger>
            </TabsList>
            <TabsContent value={timeRange} className="h-[400px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 6)}
                  />
                   <YAxis 
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString('bn-BD')}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" formatter={(value, name, props) => [`${(value as number).toLocaleString('bn-BD')}`, chartConfig.calories.label ]} />}
                  />
                  <Bar dataKey="calories" fill="var(--color-calories)" radius={4} />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
