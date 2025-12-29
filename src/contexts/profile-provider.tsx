
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { UserProfile, HealthLog } from '@/lib/types';
import { useRouter } from 'next/navigation';

type ProfileContextType = {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  activeProfileId: string | null;
  switchProfile: (profileId: string) => void;
  addProfile: (newProfileData: Omit<UserProfile, 'id' | 'calorieLogs' | 'healthLogs' | 'foodSuggestions' | 'exerciseSuggestion' | 'healthTip' | 'exerciseChecklist' | 'lastExerciseCheckDate'>) => UserProfile;
  updateProfile: (updatedProfileData: Omit<UserProfile, 'id' | 'calorieLogs' | 'healthLogs' | 'foodSuggestions' | 'exerciseSuggestion' | 'healthTip' | 'exerciseChecklist' | 'lastExerciseCheckDate'>) => void;
  deleteProfile: (profileId: string) => void;
  updateActiveProfileData: (data: Partial<Omit<UserProfile, 'id'>>) => void;
  isLoading: boolean;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useLocalStorage<UserProfile[]>('profiles', []);
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('activeProfileId', null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    if (profiles.length > 0 && !activeProfileId) {
      setActiveProfileId(profiles[0].id);
    }
    setIsLoading(false);
  }, [profiles, activeProfileId, setActiveProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const switchProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
  }, [setActiveProfileId]);

  const addProfile = (newProfileData: Omit<UserProfile, 'id' | 'calorieLogs' | 'healthLogs' | 'foodSuggestions' | 'exerciseSuggestion' | 'healthTip' | 'exerciseChecklist' | 'lastExerciseCheckDate'>) => {
    const newProfile: UserProfile = {
      ...newProfileData,
      id: new Date().toISOString() + Math.random(),
      dislikedFoods: newProfileData.dislikedFoods || '',
      calorieLogs: [],
      healthLogs: [],
      foodSuggestions: null,
      exerciseSuggestion: null,
      healthTip: null,
      exerciseChecklist: [],
      lastExerciseCheckDate: '',
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (updatedProfileData: Omit<UserProfile, 'id' | 'calorieLogs' | 'healthLogs' | 'foodSuggestions' | 'exerciseSuggestion' | 'healthTip' | 'exerciseChecklist' | 'lastExerciseCheckDate'>) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === activeProfileId) {
          // Preserve associated data
          const originalData = profiles.find(prof => prof.id === activeProfileId);
          const isProfileChanged = p.name !== updatedProfileData.name || p.age !== updatedProfileData.age || p.height !== updatedProfileData.height || p.weight !== updatedProfileData.weight || p.health_info !== updatedProfileData.health_info || p.dislikedFoods !== updatedProfileData.dislikedFoods;
          
          return {
            ...p,
            ...updatedProfileData,
            // Invalidate AI content if core profile data changed
            foodSuggestions: isProfileChanged ? null : originalData?.foodSuggestions || null,
            exerciseSuggestion: isProfileChanged ? null : originalData?.exerciseSuggestion || null,
            healthTip: isProfileChanged ? null : originalData?.healthTip || null,
          };
        }
        return p;
      })
    );
  };
  
  const updateActiveProfileData = (data: Partial<Omit<UserProfile, 'id'>>) => {
      setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...data } : p));
  };

  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfileId === profileId) {
      const remainingProfiles = profiles.filter(p => p.id !== profileId);
      setActiveProfileId(remainingProfiles.length > 0 ? remainingProfiles[0].id : null);
      if (remainingProfiles.length === 0) {
        router.push('/onboarding');
      }
    }
  };

  const value = {
    profiles,
    activeProfile,
    activeProfileId,
    switchProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    updateActiveProfileData,
    isLoading,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
