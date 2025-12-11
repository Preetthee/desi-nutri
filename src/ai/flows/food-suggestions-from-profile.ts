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

const FoodSuggestionsInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  age: z.number().describe('The age of the user.'),
  height: z.number().describe('The height of the user in cm.'),
  weight: z.number().describe('The weight of the user in kg.'),
  health_info: z.string().describe('Additional health information about the user.'),
});
export type FoodSuggestionsInput = z.infer<typeof FoodSuggestionsInputSchema>;

const FoodSuggestionsOutputSchema = z.object({
  recommended_foods: z.array(z.string()).describe('A list of recommended foods for the user.'),
  foods_to_avoid: z.array(z.string()).describe('A list of foods the user should avoid.'),
  daily_meal_plan: z.object({
    breakfast: z.string().describe('Suggested breakfast for the user.'),
    lunch: z.string().describe('Suggested lunch for the user.'),
    dinner: z.string().describe('Suggested dinner for the user.'),
    snacks: z.string().describe('Suggested snacks for the user.'),
  }).describe('A full one-day meal plan for the user.'),
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
User info: Name={{name}}, Age={{age}}, Height={{height}}, Weight={{weight}}, Health={{health_info}}
Return JSON:
{
 "recommended_foods":["",""],
 "foods_to_avoid":["",""],
 "daily_meal_plan":{
    "breakfast":"..","lunch":"..","dinner":"..","snacks":".."
 }
}`,
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
