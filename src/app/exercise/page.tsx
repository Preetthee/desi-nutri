
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import type { ExerciseSuggestion } from '@/lib/types';
import { generateExerciseSuggestion } from '@/ai/flows/generate-exercise-suggestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, RefreshCw, AlertTriangle, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/contexts/profile-provider';
import { useRouter } from 'next/navigation';

export default function ExercisePage() {
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


  const checklist = activeProfile?.exerciseChecklist || [];
  const lastCheckedDate = activeProfile?.lastExerciseCheckDate || '';

  useEffect(() => {
    if (activeProfile) {
      const today = new Date().toISOString().split('T')[0];
      if (lastCheckedDate !== today) {
        updateActiveProfileData({ exerciseChecklist: [], lastExerciseCheckDate: today });
      }
    }
  }, [lastCheckedDate, updateActiveProfileData, activeProfile]);

  const bmi = useMemo(() => {
    if (!activeProfile || !activeProfile.height || !activeProfile.weight) return null;
    const heightInMeters = activeProfile.height / 100;
    return activeProfile.weight / (heightInMeters * heightInMeters);
  }, [activeProfile]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return t('exercise.bmi_status.underweight');
    if (bmi >= 18.5 && bmi < 24.9) return t('exercise.bmi_status.normal');
    if (bmi >= 25 && bmi < 29.9) return t('exercise.bmi_status.overweight');
    return t('exercise.bmi_status.obese');
  }, [bmi, t]);

  const needsToLoseWeight = useMemo(() => {
    if (!bmi) return false;
    return bmi >= 25;
  }, [bmi]);
  
  const handleGenerateSuggestion = () => {
    if (!activeProfile) {
      toast({
        title: t('general.error'),
        description: t('food_doctor.check_food.no_profile'),
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateExerciseSuggestion({
          profile: activeProfile,
          needsToLoseWeight: needsToLoseWeight,
        });
        updateActiveProfileData({ exerciseSuggestion: result, exerciseChecklist: [] });
      } catch (error) {
        console.error(error);
        toast({
          title: t('general.ai_error'),
          description: t('general.ai_error.description'),
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
    if (isClient && activeProfile && !activeProfile.exerciseSuggestion) {
      handleGenerateSuggestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile, isClient]);

  const handleCheckChange = (exerciseNameInEnglish: string, checked: boolean | string) => {
    let newChecklist: string[];
    if(checked) {
        newChecklist = [...checklist, exerciseNameInEnglish];
    } else {
        newChecklist = checklist.filter(item => item !== exerciseNameInEnglish);
    }
    updateActiveProfileData({ exerciseChecklist: newChecklist });
  };
  
  const suggestion = activeProfile?.exerciseSuggestion;
  const allTasksCompleted = suggestion && suggestion.exercises.every(ex => checklist.includes(ex.name.en));

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
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('exercise.title')}</h1>
          <p className="text-muted-foreground">{t('exercise.description')}</p>
        </div>
         <Button onClick={() => { updateActiveProfileData({ exerciseSuggestion: null }); handleGenerateSuggestion(); }} disabled={isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {t('food_doctor.regenerate')}
        </Button>
      </div>

      <div className="grid gap-8">
        {isClient && bmi && (
             <Card>
                <CardHeader>
                    <CardTitle>{t('exercise.bmi_status.title')}</CardTitle>
                    <CardDescription>{t('exercise.bmi_status.description', {bmi: bmi.toFixed(2), status: bmiStatus})}</CardDescription>
                </CardHeader>
                {needsToLoseWeight && (
                    <CardContent>
                        <p className="text-amber-600 font-semibold flex items-center gap-2">
                           <AlertTriangle size={16} /> {t('exercise.bmi_status.recommendation')}
                        </p>
                    </CardContent>
                )}
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="text-primary" />
                    {t('exercise.plan.title')}
                </CardTitle>
                <CardDescription>{t('exercise.plan.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isPending && !suggestion ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : suggestion ? (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">{suggestion.summary[locale]}</p>
                        <div className="space-y-3">
                            <h3 className="font-semibold">{t('exercise.plan.checklist_title')}</h3>
                            {suggestion.exercises.map((ex, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                                    <Checkbox 
                                      id={`ex-${index}`} 
                                      checked={checklist.includes(ex.name.en)}
                                      onCheckedChange={(checked) => handleCheckChange(ex.name.en, checked)}
                                    />
                                    <Label htmlFor={`ex-${index}`} className="flex-1 cursor-pointer">
                                        <span className="font-medium">{ex.name[locale]}</span>
                                        <span className="text-muted-foreground text-sm block">({ex.duration_minutes} {t('exercise.plan.minutes')})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                         {allTasksCompleted && (
                            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg text-center">
                                <Award className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2"/>
                                <p className="font-bold text-green-700 dark:text-green-300">{t('exercise.plan.completed')}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">{t('exercise.plan.completed_subtext')}</p>
                            </div>
                        )}
                    </div>
                ): (
                    isClient && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('food_doctor.no_suggestions')}</p>
                      </div>
                    )
                  )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
