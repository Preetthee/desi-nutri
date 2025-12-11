'use server';
/**
 * @fileOverview Generates a personalized health tip based on user profile.
 *
 * - generateHealthTip - A function that generates a health tip.
 * - GenerateHealthTipInput - The input type for the generateHealthTip function.
 * - GenerateHealthTipOutput - The return type for the generateHealthTip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHealthTipInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  health_info: z.string().describe('The health goals and information for the user.'),
});
export type GenerateHealthTipInput = z.infer<typeof GenerateHealthTipInputSchema>;

const GenerateHealthTipOutputSchema = z.object({
  suggestion: z.string().describe('A short, actionable health suggestion or reminder for the user.'),
  explanation: z.string().describe('A brief explanation of how the suggestion will help the user achieve their health goals.'),
});
export type GenerateHealthTipOutput = z.infer<typeof GenerateHealthTipOutputSchema>;

export async function generateHealthTip(input: GenerateHealthTipInput): Promise<GenerateHealthTipOutput> {
  return generateHealthTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthTipPrompt',
  input: { schema: GenerateHealthTipInputSchema },
  output: { schema: GenerateHealthTipOutputSchema },
  prompt: `You are a friendly and encouraging health coach. Based on the user's health goals, provide a concise, actionable suggestion and a brief explanation of its benefits.
The user's name is {{name}} and their goals are: "{{health_info}}".

Keep the suggestion to a single, impactful sentence. The explanation should also be a single sentence.
Example Output for a user wanting to "lose weight":
{
  "suggestion": "Try to incorporate a 15-minute walk into your lunch break today.",
  "explanation": "This can help boost your metabolism and contribute to your daily calorie deficit."
}
`,
});

const generateHealthTipFlow = ai.defineFlow(
  {
    name: 'generateHealthTipFlow',
    inputSchema: GenerateHealthTipInputSchema,
    outputSchema: GenerateHealthTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
