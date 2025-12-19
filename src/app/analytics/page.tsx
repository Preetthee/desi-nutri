'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CalorieLog } from '@/lib/types';
import { Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  startOfDay,
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
  addDays
} from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { useTranslation } from '@/contexts/language-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => setIsClient(true), []);

  const dateLocale = locale === 'bn' ? bn : enUS;
  const numberLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

  const weekdays = useMemo(() => {
      const firstDayOfWeek = startOfWeek(new Date(), { locale: dateLocale });
      return Array.from({ length: 7 }).map((_, i) => format(addDays(firstDayOfWeek, i), 'EEE', { locale: dateLocale }));
  }, [locale, dateLocale]);

  const dailyLogs = useMemo(() => {
    const logMap = new Map<string, number>();
    logs.forEach(log => {
        try {
            const day = format(startOfDay(new Date(log.date)), 'yyyy-MM-dd');
            const currentCalories = logMap.get(day) || 0;
            logMap.set(day, currentCalories + log.total_calories);
        } catch(e) {
            // Ignore invalid dates in logs
        }
    });
    return logMap;
  }, [logs]);

  const selectedDayLog = useMemo(() => {
    if (!selectedDate) return null;
    return logs.filter(log => {
        try {
            return isSameDay(new Date(log.date), selectedDate)
        } catch(e) {
            return false;
        }
    });
  }, [logs, selectedDate]);

  const monthTotalCalories = useMemo(() => {
    if (!isClient) return 0;
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return logs
        .filter(log => {
            try {
                const logDate = new Date(log.date);
                return logDate >= monthStart && logDate <= monthEnd;
            } catch(e) {
                return false;
            }
        })
        .reduce((sum, log) => sum + log.total_calories, 0);
  }, [logs, currentMonth, isClient]);

  const weeklyPieChartData = useMemo(() => {
    if (!selectedDate || !isClient) return [];
    
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    if (locale === 'bn') {
        chartConfig.sunday.label = dayLabelsBn.sunday;
        chartConfig.monday.label = dayLabelsBn.monday;
        chartConfig.tuesday.label = dayLabelsBn.tuesday;
        chartConfig.wednesday.label = dayLabelsBn.wednesday;
        chartConfig.thursday.label = dayLabelsBn.thursday;
        chartConfig.friday.label = dayLabelsBn.friday;
        chartConfig.saturday.label = dayLabelsBn.saturday;
      }


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
  }, [selectedDate, dailyLogs, isClient, locale]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const totalDays = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(monthStart); // 0 for Sunday, 1 for Monday, etc.

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const paddedDays = [...Array(firstDayOfMonth).fill(null), ...days];
    return paddedDays;
  }, [currentMonth]);
  
  const changeMonth = (amount: number) => {
    setCurrentMonth(prev => amount > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  };
  
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">{t('analytics.description')}</p>
      </div>

      <div className="grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('analytics.calendar_view')}</CardTitle>
                <CardDescription>
                    {t('analytics.calendar_view.description', { total: monthTotalCalories.toLocaleString(numberLocale)})}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isClient ? (
                  <div className="w-full max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold font-headline">
                            {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                        </h2>
                        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-sm text-muted-foreground">
                        {weekdays.map((day, index) => <div key={`day-${index}`} className="font-medium pb-2">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} />;
                            
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const dayKey = format(date, 'yyyy-MM-dd');
                            const hasLog = dailyLogs.has(dayKey);

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors",
                                        isSameDay(date, new Date()) && "bg-muted text-foreground",
                                        isSameDay(date, selectedDate) && "bg-primary text-primary-foreground",
                                        !isSameDay(date, selectedDate) && "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <div className="relative">
                                      {day}
                                      {hasLog && <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                  </div>
                ) : <Skeleton className="w-full h-[337px]" />}
            </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
            {selectedDate && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.daily_log_for', { date: format(selectedDate, 'PPP', { locale: dateLocale }) })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDayLog && selectedDayLog.length > 0 ? (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
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
