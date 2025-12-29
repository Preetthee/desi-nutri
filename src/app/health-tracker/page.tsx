
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/contexts/profile-provider';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/language-provider';
import type { HealthLog } from '@/lib/types';
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export default function HealthTrackerPage() {
  const { activeProfile, updateActiveProfileData, isLoading } = useProfile();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();
  const [date, setDate] = useState<Date>(new Date());

  const formSchema = z.object({
    water: z.coerce.number().min(0, "Must be positive"),
    steps: z.coerce.number().min(0, "Must be positive"),
    workoutMinutes: z.coerce.number().min(0, "Must be positive"),
    sleepHours: z.coerce.number().min(0, "Must be positive").max(24, "Cannot be more than 24"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      water: 0,
      steps: 0,
      workoutMinutes: 0,
      sleepHours: 0,
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !activeProfile) {
      router.replace('/onboarding');
    }
  }, [isClient, isLoading, activeProfile, router]);
  
  const todayLog = useMemo(() => {
    if (!activeProfile || !date) return null;
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    return (activeProfile.healthLogs || []).find(log => log.date === dateKey);
  }, [activeProfile, date]);

  useEffect(() => {
    if (todayLog) {
      form.reset(todayLog);
    } else {
      form.reset({ water: 0, steps: 0, workoutMinutes: 0, sleepHours: 0 });
    }
  }, [todayLog, form]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!activeProfile || !date) return;

    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
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

    toast({
      title: t('health_tracker.success'),
    });
  };

  if (isLoading || (isClient && !activeProfile)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('health_tracker.title')}</h1>
        <p className="text-muted-foreground">{t('health_tracker.description')}</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
           <div className="flex justify-between items-center">
             <div>
              <CardTitle>{t('health_tracker.log_for_date', { date: format(date, 'PPP') })}</CardTitle>
             </div>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="water"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('health_tracker.water')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('health_tracker.water.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('health_tracker.steps')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('health_tracker.steps.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workoutMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('health_tracker.workout')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('health_tracker.workout.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('health_tracker.sleep')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder={t('health_tracker.sleep.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">{t('general.save')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
