
'use client';

import { useProfile } from '@/contexts/profile-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useTranslation } from '@/contexts/language-provider';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { addProfile, switchProfile } = useProfile();
  const router = useRouter();
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
    defaultValues: {
      name: '',
      age: 0,
      height: 0,
      weight: 0,
      health_info: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newProfile = addProfile(values);
    switchProfile(newProfile.id);
    router.push('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
            <Logo className="mb-2"/>
          <CardTitle className="text-2xl font-headline">{t('onboarding.welcome')}</CardTitle>
          <CardDescription>{t('onboarding.description')}</CardDescription>
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
              <Button type="submit" className="w-full">{t('onboarding.submit')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
