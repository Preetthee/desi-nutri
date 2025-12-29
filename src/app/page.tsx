
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { LocalizedHealthTip, HealthTip, CalorieLog, HealthLog } from '@/lib/types';
import { generateHealthTip } from '@/ai/flows/generate-health-tip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, TrendingUp, TrendingDown, ArrowRight, Lightbulb, Droplets, Footprints, BedDouble, ShieldCheck, ListTodo, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, startOfYesterday, isSameDay, subDays, format } from 'date-fns';
import { useTranslation } from '@/contexts/language-provider';
import { useProfile } from '@/contexts/profile-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { activeProfile, updateActiveProfileData, isLoading: isProfileLoading } = useProfile();
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isProfileLoading && !activeProfile) {
      router.replace('/onboarding');
    }
  }, [isClient, isProfileLoading, activeProfile, router]);
  
  const recentHealthLogForTip = useMemo(() => {
    if (!isClient || !activeProfile || !activeProfile.healthLogs || activeProfile.healthLogs.length === 0) return null;
    const sortedLogs = [...activeProfile.healthLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = startOfToday();
    const yesterday = startOfYesterday();
    
    // Find log for today or yesterday
    return sortedLogs.find(log => {
      try {
        const logDate = new Date(log.date);
        return isSameDay(logDate, today) || isSameDay(logDate, yesterday);
      } catch(e) {
        return false;
      }
    }) || null;
  }, [isClient, activeProfile]);


  useEffect(() => {
    if (isClient && activeProfile && !activeProfile.healthTip) {
      const fetchHealthTip = async () => {
        setIsLoadingTip(true);
        try {
          const tip = await generateHealthTip({
            name: activeProfile.name,
            health_info: activeProfile.health_info,
            recent_log: recentHealthLogForTip ? {
                water: recentHealthLogForTip.water,
                steps: recentHealthLogForTip.steps,
                sleepHours: recentHealthLogForTip.sleepHours,
            } : undefined
          });
          updateActiveProfileData({ healthTip: tip });
        } catch (error) {
          console.error("Failed to fetch health tip:", error);
          // Fallback is handled by checking healthTip value in render
        } finally {
          setIsLoadingTip(false);
        }
      };
      fetchHealthTip();
    } else if (activeProfile?.healthTip) {
      setIsLoadingTip(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, activeProfile, recentHealthLogForTip]);

  const { todayCalories, trendPercentage, todayHealthLog } = useMemo(() => {
    if (!isClient || !activeProfile) return { todayCalories: 0, trendPercentage: 0, todayHealthLog: null };
    
    const logs: CalorieLog[] = activeProfile.calorieLogs || [];
    const healthLogs: HealthLog[] = activeProfile.healthLogs || [];
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const todayKey = format(today, 'yyyy-MM-dd');

    const todayCalories = logs
      .filter(log => {
        try {
          return isSameDay(new Date(log.date), today)
        } catch(e) {
          return false;
        }
      })
      .reduce((sum, log) => sum + log.total_calories, 0);

    const yesterdayCalories = logs
      .filter(log => {
         try {
          return isSameDay(new Date(log.date), yesterday)
        } catch(e) {
          return false;
        }
      })
      .reduce((sum, log) => sum + log.total_calories, 0);

    let trendPercentage = 0;
    if (yesterdayCalories > 0) {
      trendPercentage = ((todayCalories - yesterdayCalories) / yesterdayCalories) * 100;
    } else if (todayCalories > 0) {
      trendPercentage = 100;
    }
    
    const todayHealthLog = healthLogs.find(log => log.date === todayKey) || null;

    return { todayCalories, trendPercentage, todayHealthLog };
  }, [activeProfile, isClient]);

  const TrendIcon = trendPercentage > 0 ? TrendingUp : trendPercentage < 0 ? TrendingDown : ArrowRight;
  const trendColor = trendPercentage > 0 ? 'text-red-500' : trendPercentage < 0 ? 'text-green-500' : 'text-muted-foreground';

  if (!isClient || isProfileLoading || !activeProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const numberLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

  const displayedHealthTip: HealthTip = activeProfile.healthTip ? activeProfile.healthTip[locale] : {
      suggestion: t('home.health_tip.fallback.suggestion'),
      explanation: t('home.health_tip.fallback.explanation'),
  };

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          {t('home.welcome', { name: activeProfile.name })}
        </h1>
        <p className="text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('home.today_calories')}</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalories.toLocaleString(numberLocale)}</div>
             <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendIcon className={`h-3 w-3 ${trendColor}`} />
              <span className={trendColor}>
                 {trendPercentage.toFixed(1)}%
              </span>
               {t('home.daily_trend.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('daily_tracker.health_metrics.water')}</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(todayHealthLog?.water || 0).toLocaleString(numberLocale)} ml</div>
            <p className="text-xs text-muted-foreground">{t('home.goal.water')}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('daily_tracker.health_metrics.steps')}</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(todayHealthLog?.steps || 0).toLocaleString(numberLocale)}</div>
            <p className="text-xs text-muted-foreground">{t('home.goal.steps')}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('daily_tracker.health_metrics.sleep')}</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(todayHealthLog?.sleepHours || 0).toLocaleString(numberLocale, {maximumFractionDigits: 1})} hrs</div>
            <p className="text-xs text-muted-foreground">{t('home.goal.sleep')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            {t('home.health_tip')}
          </CardTitle>
           {activeProfile.healthTip?.[locale]?.context && (
              <p className="text-xs text-muted-foreground pt-1">{activeProfile.healthTip[locale].context}</p>
            )}
        </CardHeader>
        <CardContent>
          {isLoadingTip ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
              <>
                <p className="font-semibold text-lg">"{displayedHealthTip.suggestion}"</p>
                <p className="text-muted-foreground mt-2">{displayedHealthTip.explanation}</p>
              </>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">{t('home.quick_actions.title')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
            <Link href="/food-doctor" passHref>
                <Button variant="outline" className="w-full h-16 justify-start text-left">
                    <ShieldCheck className="mr-4 text-primary"/>
                    <div>
                        <p className="font-semibold">{t('home.quick_actions.food_doctor')}</p>
                        <p className="text-xs text-muted-foreground">{t('home.quick_actions.food_doctor.desc')}</p>
                    </div>
                </Button>
            </Link>
            <Link href="/daily-tracker" passHref>
                <Button variant="outline" className="w-full h-16 justify-start text-left">
                    <ListTodo className="mr-4 text-primary"/>
                    <div>
                        <p className="font-semibold">{t('home.quick_actions.log_intake')}</p>
                        <p className="text-xs text-muted-foreground">{t('home.quick_actions.log_intake.desc')}</p>
                    </div>
                </Button>
            </Link>
            <Link href="/analytics" passHref>
                <Button variant="outline" className="w-full h-16 justify-start text-left">
                    <BarChart className="mr-4 text-primary"/>
                     <div>
                        <p className="font-semibold">{t('home.quick_actions.view_analytics')}</p>
                        <p className="text-xs text-muted-foreground">{t('home.quick_actions.view_analytics.desc')}</p>
                    </div>
                </Button>
            </Link>
        </div>
      </div>
    </main>
  );
}

    