
'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { UserProfile, CalorieLog, FoodSuggestions, LocalizedHealthTip } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/contexts/language-provider';

export default function SettingsPage() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [, setLogs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [, setSuggestions] = useLocalStorage<FoodSuggestions | null>('foodSuggestions', null);
  const [, setHealthTip] = useLocalStorage<LocalizedHealthTip | null>('healthTip', null);
  const [, setExerciseSuggestion] = useLocalStorage<any | null>('exerciseSuggestion', null);
  const [, setExerciseChecklist] = useLocalStorage<string[]>('exerciseChecklist', []);
  const [, setLastExerciseCheckDate] = useLocalStorage<string>('lastExerciseCheckDate', '');
  
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(2, t('onboarding.name.error')),
    age: z.coerce.number().min(1, t('onboarding.age.error')),
    height: z.coerce.number().min(1, t('onboarding.height.error')),
    weight: z.coerce.number().min(1, t('onboarding.weight.error')),
    health_info: z.string().min(10, t('onboarding.health_info.error')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profile || {
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
    const isProfileChanged = JSON.stringify(profile) !== JSON.stringify(values);
    
    setProfile(values);
    
    if(isProfileChanged) {
        // Invalidate AI-generated content if profile changes
        setSuggestions(null);
        setHealthTip(null);
        setExerciseSuggestion(null);
    }

    toast({
        title: t('settings.profile.success'),
    })
  }

  function handleClearData() {
    // Clear all localStorage data
    setProfile(null);
    setLogs([]);
    setSuggestions(null);
    setHealthTip(null);
    setExerciseSuggestion(null);
    setExerciseChecklist([]);
    setLastExerciseCheckDate('');

    // Also remove the keys directly
    if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('calorieLogs');
        localStorage.removeItem('foodSuggestions');
        localStorage.removeItem('healthTip');
        localStorage.removeItem('exerciseSuggestion');
        localStorage.removeItem('exerciseChecklist');
        localStorage.removeItem('lastExerciseCheckDate');
    }

    toast({
        title: t('settings.danger_zone.clear_data.success'),
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
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <Card>
            <CardHeader>
            <CardTitle>{t('settings.profile.title')}</CardTitle>
            <CardDescription>{t('settings.profile.description')}</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('onboarding.name')}</FormLabel>
                        <FormControl>
                        <Input placeholder={t('onboarding.name.placeholder')} {...field} />
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
                        <FormLabel>{t('onboarding.age')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder={t('onboarding.age.placeholder')} {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
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
                        <FormLabel>{t('onboarding.height')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder={t('onboarding.height.placeholder')} {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
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
                        <FormLabel>{t('onboarding.weight')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder={t('onboarding.weight.placeholder')} {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
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
                        <FormLabel>{t('onboarding.health_info')}</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder={t('onboarding.health_info.placeholder')}
                            {...field}
                        />
                        </FormControl>
                        <FormDescription>
                        {t('onboarding.health_info.description')}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">{t('settings.profile.submit')}</Button>
                </form>
            </Form>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">{t('settings.danger_zone.title')}</CardTitle>
                <CardDescription>{t('settings.danger_zone.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('settings.danger_zone.clear_data')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('settings.danger_zone.confirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('settings.danger_zone.confirm.description')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('settings.danger_zone.confirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearData}>{t('settings.danger_zone.confirm.continue')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
