'use server';
/**
 * @fileOverview Checks if a specific food is appropriate for a user based on their profile.
 *
 * - checkFoodAppropriateness - A function that handles the food check process.
 * - CheckFoodAppropriatenessInput - The input type for the function.
 * - CheckFoodAppropriatenessOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LocalizedTextSchema } from '@/lib/types';

const UserProfileSchema = z.object({
  name: z.string(),
  age: z.number(),
  height: z.number(),
  weight: z.number(),
  health_info: z.string(),
});

const CheckFoodAppropriatenessInputSchema = z.object({
  profile: UserProfileSchema.describe("The user's health profile."),
  foodName: z.string().describe('The name of the food to check.'),
});
export type CheckFoodAppropriatenessInput = z.infer<typeof CheckFoodAppropriatenessInputSchema>;

const CheckFoodAppropriatenessOutputSchema = z.object({
  isAllowed: z.boolean().describe('Whether the user is allowed to eat the food.'),
  recommendation: LocalizedTextSchema.describe('A detailed recommendation about the food, including portion size if allowed, in both Bengali and English.'),
  reason: LocalizedTextSchema.describe('The reason for the recommendation, in both Bengali and English.'),
});
export type CheckFoodAppropriatenessOutput = z.infer<typeof CheckFoodAppropriatenessOutputSchema>;


const checkFoodFlow = ai.defineFlow(
  {
    name: 'checkFoodFlow',
    inputSchema: CheckFoodAppropriatenessInputSchema,
    outputSchema: CheckFoodAppropriatenessOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'checkFoodAppropriatenessPrompt',
      input: { schema: CheckFoodAppropriatenessInputSchema },
      output: { schema: CheckFoodAppropriatenessOutputSchema },
      prompt: `You are an expert nutritionist. A user wants to know if they can eat a specific food based on their health profile.
Provide the entire response in both Bengali and English.

User Profile:
- Name: {{profile.name}}
- Age: {{profile.age}}
- Height: {{profile.height}} cm
- Weight: {{profile.weight}} kg
- Health Info & Goals: "{{profile.health_info}}"

Food to check: "{{foodName}}"

Based on the user's profile, determine if they should eat this food.
- If it's allowed, set isAllowed to true.
- If it's not allowed, set isAllowed to false.
- Provide a recommendation (including portion size if allowed) and a reason for the decision in both English and Bengali.

Example for a diabetic user asking about "Mango":
{
  "isAllowed": true,
  "recommendation": {
    "bn": "হ্যাঁ, আপনি আম খেতে পারেন, তবে পরিমিত পরিমাণে। একবারে অর্ধেক আমের বেশি খাবেন না।",
    "en": "Yes, you can eat mango, but in moderation. Do not eat more than half a mango at a time."
  },
  "reason": {
    "bn": "আমে প্রাকৃতিক চিনি থাকে যা রক্তে শর্করার মাত্রা বাড়াতে পারে, তাই পরিমাণ সীমিত রাখা জরুরি।",
    "en": "Mango contains natural sugar that can raise blood sugar levels, so it's important to limit the amount."
  }
}

Example for a user with gluten allergy asking about "Roti":
{
  "isAllowed": false,
  "recommendation": {
    "bn": "না, আপনার রুটি খাওয়া উচিত নয় কারণ এটি গমের তৈরি।",
    "en": "No, you should not eat roti because it is made of wheat."
  },
  "reason": {
    "bn": "আপনার গ্লুটেন অ্যালার্জি আছে এবং গমের রুটিতে গ্লুটেন থাকে, যা আপনার জন্য ক্ষতিকর হতে পারে।",
    "en": "You have a gluten allergy, and wheat roti contains gluten, which can be harmful to you."
  }
}
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function checkFoodAppropriateness(input: CheckFoodAppropriatenessInput): Promise<CheckFoodAppropriatenessOutput> {
  return await checkFoodFlow(input);
}
