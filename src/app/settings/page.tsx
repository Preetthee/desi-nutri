'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { UserProfile, CalorieLog, FoodSuggestions } from '@/lib/types';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


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
  const [, setLogs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [, setSuggestions] = useLocalStorage<FoodSuggestions | null>('foodSuggestions', null);
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

  function handleClearData() {
    setProfile(null);
    setLogs([]);
    setSuggestions(null);
    toast({
        title: 'ডেটা সাফ করা হয়েছে',
        description: 'আপনার সমস্ত ডেটা মুছে ফেলা হয়েছে।',
    });
    router.push('/onboarding');
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
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <Card>
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

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">বিপজ্জনক এলাকা</CardTitle>
                <CardDescription>এই ক্রিয়াগুলি ফিরিয়ে আনা যাবে না। দয়া করে সাবধানে এগিয়ে যান।</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            সমস্ত ডেটা সাফ করুন
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                        <AlertDialogDescription>
                            এই ক্রিয়াটি ফিরিয়ে আনা যাবে না। এটি আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলবে এবং আপনাকে আবার অনবোর্ডিং পৃষ্ঠা থেকে শুরু করতে হবে।
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearData}>চালিয়ে যান</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
