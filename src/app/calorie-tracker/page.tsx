
'use client';

import { useState, useTransition, useEffect } from 'react';
import { estimateCalories } from '@/ai/flows/estimate-calories-from-food-text';
import type { CalorieLog } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from '@/contexts/language-provider';
import { useProfile } from '@/contexts/profile-provider';
import { useRouter } from 'next/navigation';

export default function CalorieTrackerPage() {
  const { activeProfile, updateActiveProfileData, isLoading: isProfileLoading } = useProfile();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isProfileLoading && !activeProfile) {
      router.replace('/onboarding');
    }
  }, [isClient, isProfileLoading, activeProfile, router]);


  const formSchema = z.object({
    foodText: z.string().min(3, t('calorie_tracker.new_log.placeholder')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodText: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!activeProfile) return;
    startTransition(async () => {
      try {
        const result = await estimateCalories({ food: values.foodText });
        const newLog: CalorieLog = {
          id: new Date().toISOString() + Math.random(),
          food_text: values.foodText,
          items: result.items,
          total_calories: result.total_calories,
          date: new Date().toISOString(),
        };
        updateActiveProfileData({ calorieLogs: [newLog, ...(activeProfile.calorieLogs || [])] });
        form.reset();
      } catch (error) {
        console.error(error);
        toast({
          title: t('general.ai_error'),
          description: t('calorie_tracker.new_log.error'),
          variant: 'destructive',
        });
      }
    });
  };
  
  const logs = activeProfile?.calorieLogs || [];
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('calorie_tracker.title')}</h1>
          <p className="text-muted-foreground">{t('calorie_tracker.description')}</p>
        </div>
      </div>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('calorie_tracker.new_log.title')}</CardTitle>
            <CardDescription>{t('calorie_tracker.new_log.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="foodText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder={t('calorie_tracker.new_log.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  <Bot className={`mr-2 h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                  {isPending ? t('calorie_tracker.new_log.estimating') : t('calorie_tracker.new_log.button')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('calorie_tracker.recent_logs.title')}</CardTitle>
            <CardDescription>{t('calorie_tracker.recent_logs.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isClient ? (
                <p className="text-center text-muted-foreground py-4">{t('calorie_tracker.recent_logs.loading')}</p>
            ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t('calorie_tracker.recent_logs.empty')}</p>
            ) : (
            <Accordion type="single" collapsible className="w-full">
              {sortedLogs.map((log) => {
                const foodSummary = log.items.map(item => item.name[locale]).join(', ');
                return (
                <AccordionItem value={log.id} key={log.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span className="font-medium max-w-xs truncate text-left">{foodSummary}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{log.total_calories.toLocaleString(numberLocale)} {t('general.calories')}</span>
                        <span className="text-muted-foreground text-xs hidden sm:block">{format(new Date(log.date), 'MMM d, h:mm a', { locale: dateLocale })}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('calorie_tracker.log_details.item')}</TableHead>
                          <TableHead className="text-right">{t('calorie_tracker.log_details.calories')}</TableHead>
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
    </main>
  );
}
