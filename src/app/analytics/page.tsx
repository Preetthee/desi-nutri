'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CalorieLog } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  startOfDay,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { useTranslation } from '@/contexts/language-provider';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  calories: {
    label: 'Calories',
    color: 'hsl(var(--primary))',
  },
  sunday: { label: 'Sun', color: 'hsl(var(--chart-1))' },
  monday: { label: 'Mon', color: 'hsl(var(--chart-2))' },
  tuesday: { label: 'Tue', color: 'hsl(var(--chart-3))' },
  wednesday: { label: 'Wed', color: 'hsl(var(--chart-4))' },
  thursday: { label: 'Thu', color: 'hsl(var(--chart-5))' },
  friday: { label: 'Fri', color: 'hsl(var(--chart-1))' },
  saturday: { label: 'Sat', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const dayLabelsBn = {
  sunday: 'রবি',
  monday: 'সোম',
  tuesday: 'মঙ্গল',
  wednesday: 'বুধ',
  thursday: 'বৃহঃ',
  friday: 'শুক্র',
  saturday: 'শনি',
};

export default function AnalyticsPage() {
  const [logs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => setIsClient(true), []);

  const dateLocale = locale === 'bn' ? bn : enUS;
  const numberLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

  if (locale === 'bn') {
    chartConfig.calories.label = 'ক্যালোরি';
    chartConfig.sunday.label = dayLabelsBn.sunday;
    chartConfig.monday.label = dayLabelsBn.monday;
    chartConfig.tuesday.label = dayLabelsBn.tuesday;
    chartConfig.wednesday.label = dayLabelsBn.wednesday;
    chartConfig.thursday.label = dayLabelsBn.thursday;
    chartConfig.friday.label = dayLabelsBn.friday;
    chartConfig.saturday.label = dayLabelsBn.saturday;
  }

  const dailyLogs = useMemo(() => {
    const logMap = new Map<string, number>();
    logs.forEach(log => {
        const day = format(startOfDay(new Date(log.date)), 'yyyy-MM-dd');
        const currentCalories = logMap.get(day) || 0;
        logMap.set(day, currentCalories + log.total_calories);
    });
    return logMap;
  }, [logs]);

  const selectedDayLog = useMemo(() => {
    if (!date) return null;
    return logs.filter(log => isSameDay(new Date(log.date), date));
  }, [logs, date]);

  const monthTotalCalories = useMemo(() => {
    if (!isClient) return 0;
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return logs
        .filter(log => {
            const logDate = new Date(log.date);
            return logDate >= monthStart && logDate <= monthEnd;
        })
        .reduce((sum, log) => sum + log.total_calories, 0);
}, [logs, month, isClient]);


  const weeklyPieChartData = useMemo(() => {
    if (!date || !isClient) return [];
    
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const data = weekDays.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const total = dailyLogs.get(dayKey) || 0;
        const dayName = format(day, 'eeee').toLowerCase();
        return {
            name: chartConfig[dayName as keyof typeof chartConfig]?.label,
            calories: total,
            fill: `var(--color-${dayName})`
        };
    });
    
    return data.some(d => d.calories > 0) ? data : [];
  }, [date, dailyLogs, isClient, locale]);

  const DayWithDot = ({ date, children }: { date: Date, children: React.ReactNode }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const hasLog = dailyLogs.has(dayKey);
    return (
        <div className="relative">
            {children}
            {hasLog && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
    );
  };
  
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">{t('analytics.description')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>{t('analytics.calendar_view')}</CardTitle>
                <CardDescription>
                    {t('analytics.calendar_view.description', { total: monthTotalCalories.toLocaleString(numberLocale)})}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                {isClient ? (
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        month={month}
                        onMonthChange={setMonth}
                        className="rounded-md border"
                        locale={dateLocale}
                        components={{
                            Day: DayWithDot,
                        }}
                    />
                ) : <Skeleton className="w-full h-[300px]" />}
            </CardContent>
        </Card>

        <div className="space-y-8">
            {date && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.daily_log_for', { date: format(date, 'PPP', { locale: dateLocale }) })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDayLog && selectedDayLog.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDayLog.map(log => (
                                    <div key={log.id} className="text-sm border-b pb-2">
                                        <p className="font-semibold">{log.food_text}</p>
                                        <p className="text-xs text-muted-foreground">{log.total_calories.toLocaleString(numberLocale)} {t('general.calories')}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('analytics.no_log')}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.weekly_breakdown')}</CardTitle>
                    <CardDescription>{t('analytics.weekly_breakdown.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isClient && weeklyPieChartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <PieChart>
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border p-2 rounded-md shadow-lg">
                                                    <p className="label">{`${payload[0].name} : ${payload[0].value?.toLocaleString(numberLocale)}`}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Pie data={weeklyPieChartData} dataKey="calories" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {weeklyPieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    ) : isClient ? (
                        <p className="text-sm text-muted-foreground text-center py-10">{t('analytics.no_data_pie')}</p>
                    ) : <Skeleton className="w-full h-[250px]" />}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
