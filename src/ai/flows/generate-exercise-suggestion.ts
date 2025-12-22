'use server';
/**
 * @fileOverview Generates a personalized exercise suggestion based on user profile.
 *
 * - generateExerciseSuggestion - A function that generates an exercise plan.
 * - GenerateExerciseSuggestionInput - The input type for the function.
 * - GenerateExerciseSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LocalizedTextSchema } from '@/lib/types';

const GenerateExerciseSuggestionInputSchema = z.object({
  profile: z.object({
    name: z.string(),
    age: z.number(),
    height: z.number(),
    weight: z.number(),
    health_info: z.string(),
  }),
  needsToLoseWeight: z.boolean(),
});
export type GenerateExerciseSuggestionInput = z.infer<typeof GenerateExerciseSuggestionInputSchema>;

const GenerateExerciseSuggestionOutputSchema = z.object({
  summary: LocalizedTextSchema.describe("A brief, encouraging summary of the exercise plan, in both Bengali and English."),
  exercises: z.array(z.object({
    name: LocalizedTextSchema.describe("The name of the exercise, in both Bengali and English."),
    duration_minutes: z.number().describe("The duration of the exercise in minutes."),
  })).describe("A list of simple, effective exercises."),
});
export type ExerciseSuggestion = z.infer<typeof GenerateExerciseSuggestionOutputSchema>;


const generateExerciseSuggestionFlow = ai.defineFlow(
  {
    name: 'generateExerciseSuggestionFlow',
    inputSchema: GenerateExerciseSuggestionInputSchema,
    outputSchema: GenerateExerciseSuggestionOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateExerciseSuggestionPrompt',
      input: { schema: GenerateExerciseSuggestionInputSchema },
      output: { schema: GenerateExerciseSuggestionOutputSchema },
      prompt: `You are a fitness coach for people in Bangladesh. Create a simple, beginner-friendly home exercise plan. The entire response must be in both Bengali and English.

User Profile:
- Name: {{profile.name}}
- Age: {{profile.age}}
- Health Info & Goals: "{{profile.health_info}}"
- Needs to lose weight: {{#if needsToLoseWeight}}Yes{{else}}No{{/if}}

Based on the user's profile, generate a short (15-30 minutes total) exercise routine with 2-3 simple exercises.
- If the user needs to lose weight, focus on cardio and full-body movements.
- If the user does not need to lose weight, focus on general fitness and flexibility.
- Keep the exercises very simple, requiring no special equipment. Examples: হাঁটা/Walking, হালকা দৌড়/Jogging, সিঁড়ি দিয়ে ওঠানামা/Stair Climbing, দড়িলাফ/Jumping Jacks, স্কোয়াট/Squats, স্ট্রেচিং/Stretching.
- Provide a short, encouraging summary of the plan in both languages.

Example for a user who needs to lose weight:
{
  "summary": {
    "bn": "ওজন কমানোর জন্য এটি একটি দারুণ শুরু! এই ব্যায়ামগুলো আপনার মেটাবলিজম বাড়াতে এবং ক্যালোরি পোড়াতে সাহায্য করবে। ধারাবাহিকতা বজায় রাখুন!",
    "en": "This is a great start to losing weight! These exercises will help boost your metabolism and burn calories. Stay consistent!"
  },
  "exercises": [
    { "name": { "bn": "দ্রুত হাঁটা বা হালকা দৌড়", "en": "Fast Walking or Jogging" }, "duration_minutes": 15 },
    { "name": { "bn": "দড়িলাফ", "en": "Jumping Jacks" }, "duration_minutes": 5 },
    { "name": { "bn": "স্কোয়াট", "en": "Squats" }, "duration_minutes": 5 }
  ]
}

Example for a user for general fitness:
{
  "summary": {
    "bn": "শরীরকে সচল ও সুস্থ রাখতে এই ব্যায়ামগুলো খুব কার্যকর। এটি আপনার শরীরের নমনীয়তা বাড়াতে এবং মনকে সতেজ রাখতে সাহায্য করবে।",
    "en": "These exercises are very effective for keeping the body active and healthy. It will help increase your flexibility and refresh your mind."
  },
  "exercises": [
    { "name": { "bn": "হালকা স্ট্রেচিং (হাত, পা, ঘাড়)", "en": "Light Stretching (arms, legs, neck)" }, "duration_minutes": 10 },
    { "name": { "bn": "জায়গায় দাঁড়িয়ে হাঁটা", "en": "Spot Marching" }, "duration_minutes": 10 }
  ]
}
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateExerciseSuggestion(input: GenerateExerciseSuggestionInput): Promise<ExerciseSuggestion> {
  return await generateExerciseSuggestionFlow(input);
}
