
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
  health_info: z.string().describe('Health goals, conditions, and any allergies. E.g., "lose weight, allergic to peanuts"'),
});

const CheckFoodAppropriatenessInputSchema = z.object({
  profile: UserProfileSchema.describe("The user's health profile."),
  foodName: z.string().describe('The name of the food to check.'),
});
export type CheckFoodAppropriatenessInput = z.infer<typeof CheckFoodAppropriatenessInputSchema>;

const CheckFoodAppropriatenessOutputSchema = z.object({
  isAllowed: z.boolean().describe('Whether the user is allowed to eat the food.'),
  recommendation: LocalizedTextSchema.describe('A detailed recommendation. If allowed, suggest portion size. If not allowed due to allergy, suggest a safe alternative. Provide text in both Bengali and English.'),
  reason: LocalizedTextSchema.describe('The reason for the recommendation. If unsafe, clearly state the allergy risk. Mention other side effects if relevant. Provide text in both Bengali and English.'),
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
- Health Info, Goals & Allergies: "{{profile.health_info}}"

Food to check: "{{foodName}}"

CRITICAL SAFETY INSTRUCTION:
1.  Check if the user's health info contains any allergies that conflict with the requested food.
2.  If the food contains an allergen mentioned by the user, you MUST set isAllowed to false. The reason MUST state the allergy risk. The recommendation MUST suggest a safe alternative.
3.  If the food is safe from an allergy perspective, then evaluate it based on other health goals (e.g., weight loss, diabetes).
4.  Mention potential side-effects (e.g., high sugar, high sodium) in the reason, even if the food is allowed.

Example for a user with "allergic to nuts" asking about "Peanut Butter":
{
  "isAllowed": false,
  "recommendation": {
    "bn": "না, আপনার পিনাট বাটার খাওয়া উচিত নয়। এর পরিবর্তে আপনি সানফ্লাওয়ার সিড বাটার বা সয়াবিনের বাটার চেষ্টা করতে পারেন।",
    "en": "No, you should not eat peanut butter. You can try sunflower seed butter or soy butter as an alternative."
  },
  "reason": {
    "bn": "আপনার বাদামে অ্যালার্জি আছে এবং পিনাট বাটার বাদাম থেকে তৈরি, যা একটি গুরুতর অ্যালার্জিক প্রতিক্রিয়া সৃষ্টি করতে পারে।",
    "en": "You have a nut allergy and peanut butter is made from peanuts, which can cause a severe allergic reaction."
  }
}

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
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function checkFoodAppropriateness(input: CheckFoodAppropriatenessInput): Promise<CheckFoodAppropriatenessOutput> {
  return await checkFoodFlow(input);
}
