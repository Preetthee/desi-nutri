
'use client';

import { useProfile } from '@/contexts/profile-provider';
import { useTranslation } from '@/contexts/language-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
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

export default function ProfilesPage() {
  const { profiles, activeProfileId, switchProfile, deleteProfile, isLoading } = useProfile();
  const { t } = useTranslation();
  const router = useRouter();

  if (isLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('profiles.title')}</h1>
        <p className="text-muted-foreground">{t('profiles.description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map(profile => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <span>{profile.name}</span>
              </CardTitle>
              <CardDescription>{profile.age} {t('onboarding.age')}, {profile.weight} {t('onboarding.weight.placeholder')}, {profile.height} {t('onboarding.height.placeholder')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground truncate"><strong>{t('onboarding.health_info')}:</strong> {profile.health_info}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-stretch">
                {profile.id === activeProfileId ? (
                    <Button variant="outline" disabled className="cursor-default">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                        {t('profiles.active')}
                    </Button>
                ) : (
                    <Button onClick={() => switchProfile(profile.id)}>
                        {t('profiles.switch_to')}
                    </Button>
                )}
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('profiles.delete')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('profiles.delete.confirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('profiles.delete.confirm.description')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('settings.danger_zone.confirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProfile(profile.id)}>{t('settings.danger_zone.confirm.continue')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        ))}

        <button 
            onClick={() => router.push('/onboarding')}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
            <PlusCircle className="h-10 w-10"/>
            <span className="font-medium">{t('profiles.add_new')}</span>
        </button>
      </div>
    </main>
  );
}
