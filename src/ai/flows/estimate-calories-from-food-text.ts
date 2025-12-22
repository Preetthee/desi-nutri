'use server';
/**
 * @fileOverview Estimates calories from food text using the Gemini API.
 *
 * - estimateCalories - A function that handles the calorie estimation process.
 * - EstimateCaloriesInput - The input type for the estimateCalories function.
 * - EstimateCaloriesOutput - The return type for the estimateCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { LocalizedTextSchema } from '@/lib/types';

const EstimateCaloriesInputSchema = z.object({
  food: z.string().describe('The food text entered by the user.'),
});
export type EstimateCaloriesInput = z.infer<typeof EstimateCaloriesInputSchema>;

const EstimateCaloriesOutputSchema = z.object({
  items: z.array(
    z.object({
      name: LocalizedTextSchema.describe('The name of the food item, in both Bengali and English.'),
      calories: z.number().describe('The estimated calories for the food item.'),
    })
  ).describe('The items in the food text and their calorie estimations'),
  total_calories: z.number().describe('The total estimated calories for the food text.'),
});
export type EstimateCaloriesOutput = z.infer<typeof EstimateCaloriesOutputSchema>;

export async function estimateCalories(input: EstimateCaloriesInput): Promise<EstimateCaloriesOutput> {
  return estimateCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateCaloriesPrompt',
  input: {schema: EstimateCaloriesInputSchema},
  output: {schema: EstimateCaloriesOutputSchema},
  prompt: `User input:\"{{food}}\"\nReturn JSON with names in both Bengali and English:\n{\"items\":[{\"name\":{\"bn\":\"\",\"en\":\"\"},\"calories\":number}],\"total_calories\":number}`,
});

const estimateCaloriesFlow = ai.defineFlow(
  {
    name: 'estimateCaloriesFlow',
    inputSchema: EstimateCaloriesInputSchema,
    outputSchema: EstimateCaloriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
