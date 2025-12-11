'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { UserProfile, CalorieLog } from '@/lib/types';
import { generateHealthTip, type GenerateHealthTipOutput } from '@/ai/flows/generate-health-tip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, TrendingUp, TrendingDown, ArrowRight, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, startOfYesterday, isSameDay } from 'date-fns';

export default function Home() {
  const [profile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [logs] = useLocalStorage<CalorieLog[]>('calorieLogs', []);
  const [healthTip, setHealthTip] = useState<GenerateHealthTipOutput | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !profile) {
      router.replace('/onboarding');
    }
  }, [isClient, profile, router]);

  useEffect(() => {
    if (isClient && profile) {
      const fetchHealthTip = async () => {
        setIsLoadingTip(true);
        try {
          const tip = await generateHealthTip({ name: profile.name, health_info: profile.health_info });
          setHealthTip(tip);
        } catch (error) {
          console.error("Failed to fetch health tip:", error);
          setHealthTip({
            suggestion: "প্রচুর পানি পান করে হাইড্রেটেড থাকুন।",
            explanation: "ಉತ್ತಮ ಜಲಸಂಚಯನವು ஒட்டுமொத்த ಆರೋಗ್ಯಕ್ಕೆ ಅವಶ್ಯಕವಾಗಿದೆ ಮತ್ತು ತೂಕ ನಿರ್ವಹണೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ."
          });
        } finally {
          setIsLoadingTip(false);
        }
      };
      fetchHealthTip();
    }
  }, [isClient, profile]);

  const { todayCalories, trendPercentage } = useMemo(() => {
    if (!isClient) return { todayCalories: 0, trendPercentage: 0 };
    
    const today = startOfToday();
    const yesterday = startOfYesterday();

    const todayCalories = logs
      .filter(log => isSameDay(new Date(log.date), today))
      .reduce((sum, log) => sum + log.total_calories, 0);

    const yesterdayCalories = logs
      .filter(log => isSameDay(new Date(log.date), yesterday))
      .reduce((sum, log) => sum + log.total_calories, 0);

    let trendPercentage = 0;
    if (yesterdayCalories > 0) {
      trendPercentage = ((todayCalories - yesterdayCalories) / yesterdayCalories) * 100;
    } else if (todayCalories > 0) {
      trendPercentage = 100;
    }

    return { todayCalories, trendPercentage };
  }, [logs, isClient]);

  const TrendIcon = trendPercentage > 0 ? TrendingUp : trendPercentage < 0 ? TrendingDown : ArrowRight;
  const trendColor = trendPercentage > 0 ? 'text-red-500' : trendPercentage < 0 ? 'text-green-500' : 'text-muted-foreground';

  if (!isClient || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            আবারও স্বাগতম, {profile.name}!
          </h1>
          <p className="text-muted-foreground">
            এখানে আপনার দৈনিক স্বাস্থ্যের স্ন্যাপশট।
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আজকের ক্যালোরি গ্রহণ</CardTitle>
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCalories.toLocaleString('bn-BD')}</div>
              <p className="text-xs text-muted-foreground">আজ মোট ক্যালোরি গ্রহণ করা হয়েছে</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">দৈনিক প্রবণতা</CardTitle>
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${trendColor}`}>
                {trendPercentage !== 0 && (trendPercentage > 0 ? '+' : '')}
                {trendPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">গতকালের তুলনায়</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" />
              আপনার দৈনিক স্বাস্থ্য টিপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTip ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              healthTip && (
                <>
                  <p className="font-semibold text-lg">"{healthTip.suggestion}"</p>
                  <p className="text-muted-foreground mt-2">{healthTip.explanation}</p>
                </>
              )
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
