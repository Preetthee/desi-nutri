
import { z } from 'zod';

export const LocalizedTextSchema = z.object({
  bn: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export type FoodSuggestions = {
  recommended_foods: LocalizedText[];
  budget_friendly_foods: LocalizedText[];
  foods_to_avoid: LocalizedText[];
  daily_meal_plan: {
    breakfast: LocalizedText;
    lunch: LocalizedText;
    dinner: LocalizedText;
    snacks: LocalizedText;
  };
};

export type CalorieLogItem = {
  name: LocalizedText;
  calories: number;
};

export type CalorieLog = {
  id: string;
  food_text: string;
  items: CalorieLogItem[];
  total_calories: number;
  date: string; // ISO string
};

export type Exercise = {
    name: LocalizedText;
    duration_minutes: number;
};

export type ExerciseSuggestion = {
    summary: LocalizedText;
    exercises: Exercise[];
};


export type HealthTip = {
  suggestion: string;
  explanation: string;
};

export type LocalizedHealthTip = {
  bn: HealthTip;
  en: HealthTip;
};

export type HealthLog = {
  date: string; // YYYY-MM-DD
  water: number; // in ml
  steps: number;
  workoutMinutes: number;
  sleepHours: number;
};


// New Profile-centric types
export type UserProfile = {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  health_info: string;
  dislikedFoods: string;
  // Associated data
  calorieLogs: CalorieLog[];
  healthLogs: HealthLog[];
  foodSuggestions: FoodSuggestions | null;
  exerciseSuggestion: ExerciseSuggestion | null;
  healthTip: LocalizedHealthTip | null;
  exerciseChecklist: string[];
  lastExerciseCheckDate: string;
};
