export type UserProfile = {
  name: string;
  age: number;
  height: number;
  weight: number;
  health_info: string;
};

export type FoodSuggestions = {
  recommended_foods: string[];
  foods_to_avoid: string[];
  daily_meal_plan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
};

export type CalorieLogItem = {
  name: string;
  calories: number;
};

export type CalorieLog = {
  id: string;
  food_text: string;
  items: CalorieLogItem[];
  total_calories: number;
  date: string; // ISO string
};
