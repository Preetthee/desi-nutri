'use client';

import { useState, useTransition, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateFoodSuggestions } from '@/ai/flows/food-suggestions-from-profile';
import type { FoodSuggestions, UserProfile } from '@/lib/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Leaf, Siren, Utensils, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FoodDoctorPage() {
  const [suggestions, setSuggestions] = useLocalStorage<FoodSuggestions | null>(
    'foodSuggestions',
    null
  );
  const [profile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!suggestions) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = () => {
    if (!profile) {
      toast({
        title: 'ত্রুটি',
        description: 'ব্যবহারকারীর প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে অনবোর্ডিং সম্পূর্ণ করুন।',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateFoodSuggestions(profile);
        setSuggestions(result);
      } catch (error) {
        console.error(error);
        toast({
          title: 'AI ত্রুটি',
          description: 'খাদ্য পরামর্শ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
          variant: 'destructive',
        });
      }
    });
  };

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
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">ফুড ডক্টর</h1>
          <p className="text-muted-foreground">আপনার ব্যক্তিগত AI-চালিত পুষ্টি নির্দেশিকা।</p>
        </div>
        <Button onClick={() => { setSuggestions(null); handleGenerate(); }} disabled={isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          পুনরায় তৈরি করুন
        </Button>
      </div>

      {isPending && (!suggestions || isClient) ? (
        renderSkeleton()
      ) : suggestions ? (
        <div className="space-y-8 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="text-primary" />
                দৈনিক আহার পরিকল্পনা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <h3 className="font-semibold">সকালের নাস্তা</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.breakfast}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">দুপুরের খাবার</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.lunch}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">রাতের খাবার</h3>
                  <p className="text-muted-foreground">{suggestions.daily_meal_plan.dinner}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">হালকা খাবার</h3>
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
                  প্রস্তাবিত খাবার
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
                  বাজেট-বান্ধব খাবার
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
                  যেসব খাবার এড়িয়ে চলতে হবে
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
            <p className="text-muted-foreground">আপনার ব্যক্তিগতকৃত খাদ্য পরিকল্পনা পেতে "পুনরায় তৈরি করুন" ক্লিক করুন।</p>
          </div>
        )
      )}
    </main>
  );
}
