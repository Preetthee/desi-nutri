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
  recommendation: z.string().describe('A detailed recommendation about the food, including portion size if allowed, in Bengali.'),
  reason: z.string().describe('The reason for the recommendation, in Bengali.'),
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
The entire response must be in Bengali.

User Profile:
- Name: {{profile.name}}
- Age: {{profile.age}}
- Height: {{profile.height}} cm
- Weight: {{profile.weight}} kg
- Health Info & Goals: "{{profile.health_info}}"

Food to check: "{{foodName}}"

Based on the user's profile, determine if they should eat this food.
- If it's allowed, set isAllowed to true and provide a recommendation including a suggested portion size.
- If it's not allowed, set isAllowed to false and explain why it should be avoided.
- The reason should briefly explain your decision based on their health data.

Example for a diabetic user asking about "Mango":
{
  "isAllowed": true,
  "recommendation": "হ্যাঁ, আপনি আম খেতে পারেন, তবে পরিমিত পরিমাণে। একবারে অর্ধেক আমের বেশি খাবেন না।",
  "reason": "আমে প্রাকৃতিক চিনি থাকে যা রক্তে শর্করার মাত্রা বাড়াতে পারে, তাই পরিমাণ সীমিত রাখা জরুরি।"
}

Example for a user with gluten allergy asking about "Roti":
{
  "isAllowed": false,
  "recommendation": "না, আপনার রুটি খাওয়া উচিত নয় কারণ এটি গমের তৈরি।",
  "reason": "আপনার গ্লুটেন অ্যালার্জি আছে এবং গমের রুটিতে গ্লুটেন থাকে, যা আপনার জন্য ক্ষতিকর হতে পারে।"
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
