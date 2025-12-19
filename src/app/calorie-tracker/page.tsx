'use client';

import { useState, useTransition, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { estimateCalories } from '@/ai/flows/estimate-calories-from-food-text';
import type { CalorieLog } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  foodText: z.string().min(3, 'অনুগ্রহ করে আপনি কী খেয়েছেন তা লিখুন।'),
});

export default function CalorieTrackerPage() {
  const [logs, setLogs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodText: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
        setLogs((prevLogs) => [newLog, ...prevLogs]);
        form.reset();
      } catch (error) {
        console.error(error);
        toast({
          title: 'AI ত্রুটি',
          description: 'ক্যালোরি অনুমান করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
          variant: 'destructive',
        });
      }
    });
  };
  
  const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">ক্যালোরি ট্র্যাকার</h1>
          <p className="text-muted-foreground">আপনার খাবার লগ করুন এবং AI-কে গণনা করতে দিন।</p>
        </div>
      </div>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>নতুন খাবার লগ করুন</CardTitle>
            <CardDescription>
              আপনি কী খেয়েছেন তা বর্ণনা করুন, যেমন: "এক বাটি ওটস সাথে ব্লুবেরি এবং একটি কফি"।
            </CardDescription>
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
                        <Textarea placeholder="উদাহরণ: ২টি রুটি, সবজি এবং এক টুকরো মাছ।" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  <Bot className={`mr-2 h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                  {isPending ? 'ক্যালোরি অনুমান করা হচ্ছে...' : 'ক্যালোরি অনুমান করুন'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক লগ</CardTitle>
            <CardDescription>আপনার লগ করা খাবারের বিস্তারিত দেখুন।</CardDescription>
          </CardHeader>
          <CardContent>
            {!isClient ? (
                <p className="text-center text-muted-foreground py-4">লগ লোড হচ্ছে...</p>
            ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">এখনও কোনো খাবার লগ করা হয়নি।</p>
            ) : (
            <Accordion type="single" collapsible className="w-full">
              {sortedLogs.map((log) => (
                <AccordionItem value={log.id} key={log.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span className="font-medium max-w-xs truncate text-left">{log.food_text}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{log.total_calories.toLocaleString('bn-BD')} ক্যালোরি</span>
                        <span className="text-muted-foreground text-xs hidden sm:block">{format(new Date(log.date), 'MMM d, h:mm a', { locale: bn })}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>খাবারের নাম</TableHead>
                          <TableHead className="text-right">ক্যালোরি</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {log.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.calories.toLocaleString('bn-BD')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
             )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
