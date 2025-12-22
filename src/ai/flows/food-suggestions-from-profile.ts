'use server';
/**
 * @fileOverview Generates personalized food suggestions based on user profile information.
 *
 * - generateFoodSuggestions - A function that generates food suggestions based on user profile.
 * - FoodSuggestionsInput - The input type for the generateFoodSuggestions function.
 * - FoodSuggestionsOutput - The return type for the generateFoodSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { LocalizedTextSchema } from '@/lib/types';

const FoodSuggestionsInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  age: z.number().describe('The age of the user.'),
  height: z.number().describe('The height of the user in cm.'),
  weight: z.number().describe('The weight of the user in kg.'),
  health_info: z.string().describe('Additional health information about the user.'),
});
export type FoodSuggestionsInput = z.infer<typeof FoodSuggestionsInputSchema>;

const FoodSuggestionsOutputSchema = z.object({
  recommended_foods: z.array(LocalizedTextSchema).describe('A list of recommended foods for the user, in both Bengali and English.'),
  budget_friendly_foods: z.array(LocalizedTextSchema).describe('A list of budget-friendly recommended foods for the user, in both Bengali and English.'),
  foods_to_avoid: z.array(LocalizedTextSchema).describe('A list of foods the user should avoid, in both Bengali and English.'),
  daily_meal_plan: z.object({
    breakfast: LocalizedTextSchema.describe('Suggested breakfast for the user, in both Bengali and English.'),
    lunch: LocalizedTextSchema.describe('Suggested lunch for the user, in both Bengali and English.'),
    dinner: LocalizedTextSchema.describe('Suggested dinner for the user, in both Bengali and English.'),
    snacks: LocalizedTextSchema.describe('Suggested snacks for the user, in both Bengali and English.'),
  }).describe('A full one-day meal plan for the user, in both Bengali and English.'),
});
export type FoodSuggestionsOutput = z.infer<typeof FoodSuggestionsOutputSchema>;

export async function generateFoodSuggestions(input: FoodSuggestionsInput): Promise<FoodSuggestionsOutput> {
  return foodSuggestionsFlow(input);
}

const foodSuggestionsPrompt = ai.definePrompt({
  name: 'foodSuggestionsPrompt',
  input: {schema: FoodSuggestionsInputSchema},
  output: {schema: FoodSuggestionsOutputSchema},
  prompt: `You are a food and nutrition expert. Based on user info below, suggest a food guide.
The entire response must be in both Bengali and English.
User info: Name={{name}}, Age={{age}}, Height={{height}}, Weight={{weight}}, Health={{health_info}}
Return JSON in this exact format:
{
  "recommended_foods": [
    {"bn": "...", "en": "..."}
  ],
  "budget_friendly_foods": [
    {"bn": "...", "en": "..."}
  ],
  "foods_to_avoid": [
    {"bn": "...", "en": "..."}
  ],
  "daily_meal_plan": {
    "breakfast": {"bn": "...", "en": "..."},
    "lunch": {"bn": "...", "en": "..."},
    "dinner": {"bn": "...", "en": "..."},
    "snacks": {"bn": "...", "en": "..."}
  }
}
`,
});

const foodSuggestionsFlow = ai.defineFlow(
  {
    name: 'foodSuggestionsFlow',
    inputSchema: FoodSuggestionsInputSchema,
    outputSchema: FoodSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await foodSuggestionsPrompt(input);
    return output!;
  }
);
