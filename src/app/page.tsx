'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, HeartPulse, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const featureCards = [
  {
    title: 'Food Doctor',
    description: 'Get personalized food recommendations and meal plans.',
    href: '/food-doctor',
    icon: HeartPulse,
    imageId: 'food-doctor',
  },
  {
    title: 'Calorie Tracker',
    description: 'Estimate calories for your meals with AI.',
    href: '/calorie-tracker',
    icon: Calculator,
    imageId: 'calorie-tracker',
  },
];

export default function Home() {
  const [profile] = useLocalStorage<UserProfile | null>('userProfile', null);
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
            Welcome back, {profile.name}!
          </h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featureCards.map((feature) => {
            const image = PlaceHolderImages.find(
              (img) => img.id === feature.imageId
            );
            return (
              <Link href={feature.href} key={feature.href}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                    <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          data-ai-hint={image.imageHint}
                        />
                      ) : (
                        <Skeleton className="h-full w-full" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
