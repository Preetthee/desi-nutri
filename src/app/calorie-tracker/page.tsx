'use client';

import { useState, useTransition } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { estimateCalories } from '@/ai/flows/estimate-calories-from-food-text';
import type { CalorieLog } from '@/lib/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Bot } from 'lucide-react';

const formSchema = z.object({
  foodText: z.string().min(3, 'Please enter what you ate.'),
});

export default function CalorieTrackerPage() {
  const [logs, setLogs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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
          title: 'AI Error',
          description: 'Failed to estimate calories. Please try again.',
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
          <h1 className="text-3xl font-bold font-headline tracking-tight">Calorie Tracker</h1>
          <p className="text-muted-foreground">Log your meals and let AI do the counting.</p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log a New Meal</CardTitle>
            <CardDescription>
              Describe what you ate, e.g., "A bowl of oatmeal with blueberries and a coffee".
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
                        <Textarea placeholder="e.g., 2 slices of whole wheat toast with avocado and a fried egg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  <Bot className={`mr-2 h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                  {isPending ? 'Estimating Calories...' : 'Estimate Calories'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Your last few logged meals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
               {logs.length === 0 && <TableCaption>No meals logged yet.</TableCaption>}
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.slice(0, 5).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium max-w-xs truncate">{log.food_text}</TableCell>
                    <TableCell className="text-right font-semibold">{log.total_calories}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(new Date(log.date), 'MMM d, h:mm a')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
