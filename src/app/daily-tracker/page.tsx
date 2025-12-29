
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { estimateCalories } from '@/ai/flows/estimate-calories-from-food-text';
import type { CalorieLog, HealthLog } from '@/lib/types';
import { useForm as useCalorieForm } from 'react-hook-form';
import { useForm as useHealthForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfDay } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form as CalorieForm, FormControl as CalorieFormControl, FormField as CalorieFormField, FormItem as CalorieFormItem, FormMessage as CalorieFormMessage } from '@/components/ui/form';
import { Form as HealthForm, FormControl as HealthFormControl, FormField as HealthFormField, FormItem as HealthFormItem, FormLabel as HealthFormLabel, FormMessage as HealthFormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Bot, Calendar as CalendarIcon, Utensils, HeartPulse } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from '@/contexts/language-provider';
import { useProfile } from '@/contexts/profile-provider';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function DailyTrackerPage() {
  const { activeProfile, updateActiveProfileData, isLoading: isProfileLoading } = useProfile();
  const [isEstimating, startEstimating] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isProfileLoading && !activeProfile) {
      router.replace('/onboarding');
    }
  }, [isClient, isProfileLoading, activeProfile, router]);
  
  // Forms
  const calorieFormSchema = z.object({
    foodText: z.string().min(3, t('daily_tracker.food_log.placeholder')),
  });
  const calorieForm = useCalorieForm<z.infer<typeof calorieFormSchema>>({
    resolver: zodResolver(calorieFormSchema),
    defaultValues: { foodText: '' },
  });

  const healthFormSchema = z.object({
    water: z.coerce.number().min(0, "Must be positive"),
    steps: z.coerce.number().min(0, "Must be positive"),
    workoutMinutes: z.coerce.number().min(0, "Must be positive"),
    sleepHours: z.coerce.number().min(0, "Must be positive").max(24, "Cannot be more than 24"),
  });
  const healthForm = useHealthForm<z.infer<typeof healthFormSchema>>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: { water: 0, steps: 0, workoutMinutes: 0, sleepHours: 0 },
  });

  // Data Memoization
  const dateKey = useMemo(() => format(startOfDay(date), 'yyyy-MM-dd'), [date]);
  
  const todaysHealthLog = useMemo(() => {
    if (!activeProfile) return null;
    return (activeProfile.healthLogs || []).find(log => log.date === dateKey);
  }, [activeProfile, dateKey]);

  const todaysCalorieLogs = useMemo(() => {
     if (!activeProfile) return [];
     return (activeProfile.calorieLogs || [])
        .filter(log => format(startOfDay(new Date(log.date)), 'yyyy-MM-dd') === dateKey)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeProfile, dateKey]);

  // Effects to sync forms with data
  useEffect(() => {
    if (todaysHealthLog) {
      healthForm.reset(todaysHealthLog);
    } else {
      healthForm.reset({ water: 0, steps: 0, workoutMinutes: 0, sleepHours: 0 });
    }
  }, [todaysHealthLog, healthForm]);


  // Handlers
  const onCalorieSubmit = (values: z.infer<typeof calorieFormSchema>) => {
    if (!activeProfile) return;
    startEstimating(async () => {
      try {
        const result = await estimateCalories({ food: values.foodText });
        const newLog: CalorieLog = {
          id: new Date().toISOString() + Math.random(),
          food_text: values.foodText,
          items: result.items,
          total_calories: result.total_calories,
          date: new Date(date).toISOString(), // Log for the selected date
        };
        updateActiveProfileData({ calorieLogs: [newLog, ...(activeProfile.calorieLogs || [])] });
        calorieForm.reset();
      } catch (error) {
        toast({
          title: t('general.ai_error'),
          description: t('daily_tracker.food_log.error'),
          variant: 'destructive',
        });
      }
    });
  };

  const onHealthSubmit = (values: z.infer<typeof healthFormSchema>) => {
    if (!activeProfile) return;
    const newLog: HealthLog = { date: dateKey, ...values };
    const existingLogs = activeProfile.healthLogs || [];
    const logIndex = existingLogs.findIndex(log => log.date === dateKey);
    let updatedLogs;
    if (logIndex > -1) {
      updatedLogs = [...existingLogs];
      updatedLogs[logIndex] = newLog;
    } else {
      updatedLogs = [...existingLogs, newLog];
    }
    updateActiveProfileData({ healthLogs: updatedLogs });
    toast({ title: t('daily_tracker.health_metrics.success') });
  };
  
  const dateLocale = locale === 'bn' ? bn : enUS;
  const numberLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

  if (isProfileLoading || (isClient && !activeProfile)) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('daily_tracker.title')}</h1>
          <p className="text-muted-foreground">{t('daily_tracker.description')}</p>
        </div>
         <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: dateLocale }) : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || new Date())}
                initialFocus
                />
            </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Left Column */}
        <div className="space-y-8">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Utensils className="text-primary"/>{t('daily_tracker.food_log.title')}</CardTitle>
                <CardDescription>{t('daily_tracker.food_log.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <CalorieForm {...calorieForm}>
                <form onSubmit={calorieForm.handleSubmit(onCalorieSubmit)} className="space-y-4">
                    <CalorieFormField
                    control={calorieForm.control}
                    name="foodText"
                    render={({ field }) => (
                        <CalorieFormItem>
                        <CalorieFormControl>
                            <Textarea placeholder={t('daily_tracker.food_log.placeholder')} {...field} />
                        </CalorieFormControl>
                        <CalorieFormMessage />
                        </CalorieFormItem>
                    )}
                    />
                    <Button type="submit" disabled={isEstimating} className="w-full">
                    <Bot className={`mr-2 h-4 w-4 ${isEstimating ? 'animate-pulse' : ''}`} />
                    {isEstimating ? t('daily_tracker.food_log.estimating') : t('daily_tracker.food_log.button')}
                    </Button>
                </form>
                </CalorieForm>
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('daily_tracker.recent_logs.title')}</CardTitle>
                    <CardDescription>{t('daily_tracker.recent_logs.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isClient ? (
                        <p className="text-center text-muted-foreground py-4">{t('general.loading')}</p>
                    ) : todaysCalorieLogs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t('daily_tracker.recent_logs.empty')}</p>
                    ) : (
                    <Accordion type="single" collapsible className="w-full">
                    {todaysCalorieLogs.map((log) => {
                        const foodSummary = log.items.map(item => item.name[locale]).join(', ');
                        return (
                        <AccordionItem value={log.id} key={log.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4">
                            <span className="font-medium max-w-xs truncate text-left">{foodSummary}</span>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{log.total_calories.toLocaleString(numberLocale)} {t('general.calories')}</span>
                                <span className="text-muted-foreground text-xs hidden sm:block">{format(new Date(log.date), 'h:mm a', { locale: dateLocale })}</span>
                            </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>{t('daily_tracker.log_details.item')}</TableHead>
                                <TableHead className="text-right">{t('daily_tracker.log_details.calories')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {log.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name[locale]}</TableCell>
                                    <TableCell className="text-right">{item.calories.toLocaleString(numberLocale)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        </AccordionContent>
                        </AccordionItem>
                        )
                    })}
                    </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <Card className="lg:sticky lg:top-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary"/>{t('daily_tracker.health_metrics.title')}</CardTitle>
                <CardDescription>{t('daily_tracker.log_for_date', { date: format(date, 'PPP', { locale: dateLocale }) })}</CardDescription>
            </CardHeader>
            <CardContent>
            <HealthForm {...healthForm}>
                <form onSubmit={healthForm.handleSubmit(onHealthSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <HealthFormField
                    control={healthForm.control}
                    name="water"
                    render={({ field }) => (
                        <HealthFormItem>
                        <HealthFormLabel>{t('daily_tracker.health_metrics.water')}</HealthFormLabel>
                        <HealthFormControl>
                            <Input type="number" placeholder={t('daily_tracker.health_metrics.water.placeholder')} {...field} />
                        </HealthFormControl>
                        <HealthFormMessage />
                        </HealthFormItem>
                    )}
                    />
                    <HealthFormField
                    control={healthForm.control}
                    name="steps"
                    render={({ field }) => (
                        <HealthFormItem>
                        <HealthFormLabel>{t('daily_tracker.health_metrics.steps')}</HealthFormLabel>
                        <HealthFormControl>
                            <Input type="number" placeholder={t('daily_tracker.health_metrics.steps.placeholder')} {...field} />
                        </HealthFormControl>
                        <HealthFormMessage />
                        </HealthFormItem>
                    )}
                    />
                    <HealthFormField
                    control={healthForm.control}
                    name="workoutMinutes"
                    render={({ field }) => (
                        <HealthFormItem>
                        <HealthFormLabel>{t('daily_tracker.health_metrics.workout')}</HealthFormLabel>
                        <HealthFormControl>
                            <Input type="number" placeholder={t('daily_tracker.health_metrics.workout.placeholder')} {...field} />
                        </HealthFormControl>
                        <HealthFormMessage />
                        </HealthFormItem>
                    )}
                    />
                    <HealthFormField
                    control={healthForm.control}
                    name="sleepHours"
                    render={({ field }) => (
                        <HealthFormItem>
                        <HealthFormLabel>{t('daily_tracker.health_metrics.sleep')}</HealthFormLabel>
                        <HealthFormControl>
                            <Input type="number" step="0.5" placeholder={t('daily_tracker.health_metrics.sleep.placeholder')} {...field} />
                        </HealthFormControl>
                        <HealthFormMessage />
                        </HealthFormItem>
                    )}
                    />
                </div>
                <Button type="submit" className="w-full">{t('general.save')}</Button>
                </form>
            </HealthForm>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}

    