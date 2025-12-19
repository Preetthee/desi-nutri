'use client';

import { useState, useTransition, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateFoodSuggestions } from '@/ai/flows/food-suggestions-from-profile';
import { checkFoodAppropriateness } from '@/ai/flows/check-food-appropriateness';
import type { CheckFoodAppropriatenessOutput } from '@/ai/flows/check-food-appropriateness';
import type { FoodSuggestions, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Leaf, Siren, Utensils, Wallet, CheckCircle, XCircle, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/contexts/language-provider';

export default function FoodDoctorPage() {
  const [suggestions, setSuggestions] = useLocalStorage<FoodSuggestions | null>('foodSuggestions', null);
  const [profile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [isGeneratingSuggestions, startGeneratingSuggestions] = useTransition();
  const [isCheckingFood, startCheckingFood] = useTransition();
  const [foodCheckResult, setFoodCheckResult] = useState<CheckFoodAppropriatenessOutput | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

  const formSchema = z.object({
    foodName: z.string().min(2, t('food_doctor.check_food.placeholder')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodName: '' },
  });

  useEffect(() => {
    setIsClient(true);
    if (!suggestions && profile) { // Only fetch if no suggestions and profile exists
      handleGenerateSuggestions();
    }
  }, [profile]); // Depend on profile

  const handleGenerateSuggestions = () => {
    if (!profile) {
      toast({
        title: t('general.error'),
        description: t('food_doctor.check_food.no_profile'),
        variant: 'destructive',
      });
      return;
    }

    startGeneratingSuggestions(async () => {
      try {
        const result = await generateFoodSuggestions(profile);
        setSuggestions(result);
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

  const onFoodCheckSubmit = (values: z.infer<typeof formSchema>) => {
    if (!profile) {
      toast({
        title: t('general.error'),
        description: t('food_doctor.check_food.no_profile'),
        variant: 'destructive',
      });
      return;
    }
    setFoodCheckResult(null);
    startCheckingFood(async () => {
      try {
        const result = await checkFoodAppropriateness({
          profile,
          foodName: values.foodName,
        });
        setFoodCheckResult(result);
      } catch (error) {
        console.error('Error checking food:', error);
        toast({
          title: t('general.ai_error'),
          description: t('general.ai_error.description'),
          variant: 'destructive',
        });
      }
    });
  };
  
  const isPending = isGeneratingSuggestions;

  const renderSkeleton = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
             {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </auditing-tool>
        </Card>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('food_doctor.title')}</h1>
          <p className="text-muted-foreground">{t('food_doctor.description')}</p>
        </div>
        <Button onClick={() => { setSuggestions(null); handleGenerateSuggestions(); }} disabled={isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {t('food_doctor.regenerate')}
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('food_doctor.check_food.title')}</CardTitle>
          <CardDescription>{t('food_doctor.check_food.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFoodCheckSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="foodName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={t('food_doctor.check_food.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isCheckingFood}>
                <Bot className={`mr-2 h-4 w-4 ${isCheckingFood ? 'animate-pulse' : ''}`} />
                {isCheckingFood ? t('food_doctor.check_food.checking') : t('food_doctor.check_food.button')}
              </Button>
            </form>
          </Form>
          {isCheckingFood && (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {foodCheckResult && (
            <Alert className="mt-4" variant={foodCheckResult.isAllowed ? 'default' : 'destructive'}>
               {foodCheckResult.isAllowed ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{foodCheckResult.isAllowed ? t('food_doctor.check_food.result.allowed') : t('food_doctor.check_food.result.not_allowed')}</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">{foodCheckResult.recommendation}</p>
                <p className="text-xs">{foodCheckResult.reason}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isPending && (!suggestions || !isClient) ? (
        renderSkeleton()
      ) : suggestions ? (
        <div className="space-y-8 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="text-primary" />
                {t('food_doctor.meal_plan.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <h3 className="font-semibold">{t('food_doctor.meal_plan.breakfast')}</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.breakfast}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{t('food_doctor.meal_plan.lunch')}</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.lunch}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{t('food_doctor.meal_plan.dinner')}</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.dinner}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{t('food_doctor.meal_plan.snacks')}</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.snacks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Leaf />
                  {t('food_doctor.recommended_foods.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {suggestions.recommended_foods?.map((food, i) => <li key={i}>{food}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
               <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Wallet />
                  {t('food_doctor.budget_friendly_foods.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {suggestions.budget_friendly_foods?.map((food, i) => <li key={i}>{food}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Siren />
                  {t('food_doctor.foods_to_avoid.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {suggestions.foods_to_avoid?.map((food, i) => <li key={i}>{food}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        isClient && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('food_doctor.no_suggestions')}</p>
          </div>
        )
      )}
    </main>
  );
}
