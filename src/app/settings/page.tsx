'use client';

import { useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।',
  }),
  age: z.coerce.number().min(1, 'বয়স আবশ্যক।'),
  height: z.coerce.number().min(1, 'উচ্চতা (সেমি) আবশ্যক।'),
  weight: z.coerce.number().min(1, 'ওজন (কেজি) আবশ্যক।'),
  health_info: z.string().min(10, 'অনুগ্রহ করে কিছু স্বাস্থ্য সম্পর্কিত তথ্য দিন।'),
});

export default function SettingsPage() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: 0,
      height: 0,
      weight: 0,
      health_info: '',
    },
  });
  
  useEffect(() => {
    if (!profile) {
      router.replace('/onboarding');
    } else {
      form.reset(profile);
    }
  }, [profile, form, router]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setProfile(values);
    toast({
        title: 'সফল',
        description: 'আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
    })
  }
  
  if (!profile) {
    return null;
  }

  return (
    <main className="flex-1 p-4 md:p-8">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">সেটিংস</h1>
          <p className="text-muted-foreground">আপনার ব্যক্তিগত এবং স্বাস্থ্য সম্পর্কিত তথ্য পরিচালনা করুন।</p>
        </div>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>প্রোফাইল সম্পাদনা করুন</CardTitle>
          <CardDescription>আপনার বিবরণ এখানে আপডেট করুন।</CardDescription>
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
                      <Input placeholder="উদাহরণ: জন ডো" {...field} />
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
                        <Input type="number" placeholder="উদাহরণ: ৩০" {...field} />
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
                        <Input type="number" placeholder="উদাহরণ: ১৭০" {...field} />
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
                        <Input type="number" placeholder="উদাহরণ: ৬৫" {...field} />
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
                        placeholder="উদাহরণ: ওজন কমাতে চাই, নিরামিষাশী।"
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
              <Button type="submit" className="w-full">পরিবর্তনগুলি সংরক্ষণ করুন</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
