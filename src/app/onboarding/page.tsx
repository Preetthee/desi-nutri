'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।',
  }),
  age: z.coerce.number().min(1, 'বয়স আবশ্যক।'),
  height: z.coerce.number().min(1, 'উচ্চতা (সেমি) আবশ্যক।'),
  weight: z.coerce.number().min(1, 'ওজন (কেজি) আবশ্যক।'),
  health_info: z.string().min(10, 'অনুগ্রহ করে কিছু স্বাস্থ্য সম্পর্কিত তথ্য দিন।'),
});

export default function OnboardingPage() {
  const [, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: undefined,
      height: undefined,
      weight: undefined,
      health_info: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setProfile(values);
    router.push('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
            <Logo className="mb-2"/>
          <CardTitle className="text-2xl font-headline">দেশি নিউট্রিতে স্বাগতম</CardTitle>
          <CardDescription>আপনার অভিজ্ঞতা ব্যক্তিগতকৃত করতে আপনার সম্পর্কে কিছু তথ্য দিন।</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>নাম</FormLabel>
                    <FormControl>
                      <Input placeholder="उदा: জন ডো" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বয়স</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="उदा: ৩০" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>উচ্চতা (সেমি)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="उदा: ১৭০" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ওজন (কেজি)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="उदा: ৬৫" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="health_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>স্বাস্থ্য সম্পর্কিত তথ্য ও লক্ষ্য</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="उदा: ওজন কমাতে চাই, গ্লুটেন অ্যালার্জি আছে, নিরামিষাশী।"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      এটি আমাদের আপনাকে আরও ভালো পরামর্শ দিতে সাহায্য করবে।
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">শুরু করুন</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
