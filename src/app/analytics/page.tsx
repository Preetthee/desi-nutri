
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useProfile } from '@/contexts/profile-provider';
import type { CalorieLog, HealthLog } from '@/lib/types';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  BarChart,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip as ChartTooltipContainer,
  ChartTooltipContent,
  ChartLegend as ChartLegendContainer,
  ChartLegendContent
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  startOfDay,
  endOfDay,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getDay,
  addMonths,
  subMonths,
  addDays,
  isAfter,
} from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { useTranslation } from '@/contexts/language-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ViewMode = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsPage() {
  const { activeProfile, isLoading: isProfileLoading } = useProfile();
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (isClient && !isProfileLoading && !activeProfile) {
      router.replace('/onboarding');
    }
  }, [isClient, isProfileLoading, activeProfile, router]);

  const dateLocale = locale === 'bn' ? bn : enUS;
  const numberLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

  const calorieLogs = activeProfile?.calorieLogs || [];
  const healthLogs = activeProfile?.healthLogs || [];

  const chartData = useMemo(() => {
    if (!isClient) return [];
    
    let start, end;
    const today = new Date();

    switch (viewMode) {
      case 'daily':
        start = startOfWeek(today, { locale: dateLocale });
        end = endOfWeek(today, { locale: dateLocale });
        break;
      case 'weekly':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'monthly':
        start = startOfDay(subMonths(today, 5));
        end = endOfDay(today);
        break;
    }
    
    const interval = eachDayOfInterval({ start, end });
    
    const logsByDate = new Map<string, {calories: number; steps: number; water: number; workout: number; sleep: number; count: number }>();

    [...calorieLogs, ...healthLogs].forEach(log => {
      try {
          const date = startOfDay(new Date(log.date));
          const key = format(date, 'yyyy-MM-dd');
          
          if (!logsByDate.has(key)) {
              logsByDate.set(key, { calories: 0, steps: 0, water: 0, workout: 0, sleep: 0, count: 0 });
          }
          const entry = logsByDate.get(key)!;

          if ('total_calories' in log) { // CalorieLog
              entry.calories += log.total_calories;
          } else { // HealthLog
              entry.steps = log.steps || entry.steps;
              entry.water = log.water || entry.water;
              entry.workout = log.workoutMinutes || entry.workout;
              entry.sleep = log.sleepHours || entry.sleep;
          }

      } catch (e) {
          // Ignore invalid dates
      }
    });

    if(viewMode === 'monthly') {
        const monthMap = new Map<string, {calories: number; steps: number; water: number; workout: number; sleep: number; days: number}>();
        logsByDate.forEach((value, key) => {
            const monthKey = format(new Date(key), 'yyyy-MM');
            if(!monthMap.has(monthKey)) {
                monthMap.set(monthKey, { calories: 0, steps: 0, water: 0, workout: 0, sleep: 0, days: 0 });
            }
            const monthEntry = monthMap.get(monthKey)!;
            monthEntry.calories += value.calories;
            monthEntry.steps += value.steps;
            monthEntry.water += value.water;
            monthEntry.workout += value.workout;
            monthEntry.sleep += value.sleep;
            monthEntry.days++;
        });

        return Array.from(monthMap.entries()).map(([key, value]) => ({
            name: format(new Date(key), 'MMM yy', { locale: dateLocale }),
            calories: value.days > 0 ? Math.round(value.calories / value.days) : 0,
            steps: value.days > 0 ? Math.round(value.steps / value.days) : 0,
            water: value.days > 0 ? Math.round(value.water / value.days) : 0,
            workout: value.days > 0 ? Math.round(value.workout / value.days) : 0,
            sleep: value.days > 0 ? parseFloat((value.sleep / value.days).toFixed(1)) : 0,
        })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }

    if (viewMode === 'weekly') {
        const weekMap = new Map<string, {calories: number; steps: number; water: number; workout: number; sleep: number; days: number}>();
        logsByDate.forEach((value, key) => {
            const weekStart = startOfWeek(new Date(key), { locale: dateLocale });
            const weekKey = format(weekStart, 'yyyy-MM-dd');
            if(!weekMap.has(weekKey)) {
                weekMap.set(weekKey, { calories: 0, steps: 0, water: 0, workout: 0, sleep: 0, days: 0 });
            }
            const weekEntry = weekMap.get(weekKey)!;
            weekEntry.calories += value.calories;
            weekEntry.steps += value.steps;
            weekEntry.water += value.water;
            weekEntry.workout += value.workout;
            weekEntry.sleep += value.sleep;
            if (value.calories > 0 || value.steps > 0 || value.water > 0 || value.workout > 0 || value.sleep > 0) {
              weekEntry.days++;
            }
        });
        
        return Array.from(weekMap.entries()).map(([key, value]) => ({
            name: format(new Date(key), 'MMM d', { locale: dateLocale }),
            calories: value.days > 0 ? Math.round(value.calories / value.days) : 0,
            steps: value.days > 0 ? Math.round(value.steps / value.days) : 0,
            water: value.days > 0 ? Math.round(value.water / value.days) : 0,
            workout: value.days > 0 ? Math.round(value.workout / value.days) : 0,
            sleep: value.days > 0 ? parseFloat((value.sleep / value.days).toFixed(1)) : 0,
        })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }


    return interval.map(day => {
        const key = format(day, 'yyyy-MM-dd');
        const data = logsByDate.get(key) || { calories: 0, steps: 0, water: 0, workout: 0, sleep: 0 };
        return {
            name: format(day, 'EEE', { locale: dateLocale }),
            ...data
        };
    });

  }, [isClient, calorieLogs, healthLogs, dateLocale, viewMode]);

  const renderChart = (dataKey: string, name: string, color: string, type: 'line' | 'bar') => {
    const ChartComponent = type === 'line' ? LineChart : BarChart;
    const ChartElement = type === 'line' ? Line : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent formatter={(value) => typeof value === 'number' ? value.toLocaleString(numberLocale) : value} />} />
          <Legend />
          <ChartElement type="monotone" dataKey={dataKey} name={name} stroke={color} fill={color} />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };
  
  if (isProfileLoading || (isClient && !activeProfile)) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">{t('analytics.description')}</p>
      </div>

       <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mb-8">
        <TabsList>
          <TabsTrigger value="daily">{t('analytics.view.daily')}</TabsTrigger>
          <TabsTrigger value="weekly">{t('analytics.view.weekly')}</TabsTrigger>
          <TabsTrigger value="monthly">{t('analytics.view.monthly')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.calories_chart_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isClient ? renderChart('calories', t('general.calories'), 'hsl(var(--primary))', 'bar') : <Skeleton className="h-[300px] w-full" />}
          </CardContent>
        </Card>
        
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.steps_chart_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isClient ? renderChart('steps', t('health_tracker.steps'), 'hsl(var(--chart-2))', 'line') : <Skeleton className="h-[300px] w-full" />}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.sleep_chart_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                     {isClient ? renderChart('sleep', t('health_tracker.sleep'), 'hsl(var(--chart-3))', 'line') : <Skeleton className="h-[300px] w-full" />}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.water_chart_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                     {isClient ? renderChart('water', t('health_tracker.water'), 'hsl(var(--chart-4))', 'bar') : <Skeleton className="h-[300px] w-full" />}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.workout_chart_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isClient ? renderChart('workout', t('health_tracker.workout'), 'hsl(var(--chart-5))', 'bar') : <Skeleton className="h-[300px] w-full" />}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
