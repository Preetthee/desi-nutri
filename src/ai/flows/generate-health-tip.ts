
'use server';
/**
 * @fileOverview Generates a personalized health tip based on user profile and recent health logs.
 *
 * - generateHealthTip - A function that generates a health tip.
 * - GenerateHealthTipInput - The input type for the generateHealthTip function.
 * - GenerateHealthTipOutput - The return type for the generateHealthTip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { HealthLog } from '@/lib/types';


const GenerateHealthTipInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  health_info: z.string().describe('The health goals and information for the user.'),
  recent_log: z.object({
    water: z.number(),
    steps: z.number(),
    sleepHours: z.number(),
  }).optional().describe('The most recent health log for the user.'),
});
export type GenerateHealthTipInput = z.infer<typeof GenerateHealthTipInputSchema>;

const TipSchema = z.object({
    suggestion: z.string().describe('A short, actionable health suggestion or reminder for the user.'),
    explanation: z.string().describe('A brief explanation of how the suggestion will help the user achieve their health goals.'),
    context: z.string().optional().describe('A brief note about which data point triggered this tip (e.g., "Based on your sleep log").'),
});

const GenerateHealthTipOutputSchema = z.object({
  bn: TipSchema,
  en: TipSchema,
});
export type GenerateHealthTipOutput = z.infer<typeof GenerateHealthTipOutputSchema>;

const generateTipForLocale = async (input: GenerateHealthTipInput, locale: 'bn' | 'en'): Promise<z.infer<typeof TipSchema>> => {
    const prompt = ai.definePrompt({
        name: `generateHealthTipPrompt-${locale}`,
        input: { schema: GenerateHealthTipInputSchema },
        output: { schema: TipSchema },
        prompt: `You are a friendly and encouraging health coach in Bangladesh. Based on the user's profile and recent health log, provide a concise, actionable suggestion, a brief explanation, and a context for the tip.
The entire response must be in ${locale === 'bn' ? 'Bengali' : 'English'}.

User Profile:
- Name: {{name}}
- Goals: "{{health_info}}"

Recent Health Log (from yesterday/today):
- Water Intake: {{recent_log.water}} ml
- Steps: {{recent_log.steps}}
- Sleep: {{recent_log.sleepHours}} hours

Tip Generation Rules:
1.  **Prioritize Log Data**: First, check the 'Recent Health Log'. Generate a tip based on this data if applicable.
2.  **Sleep First**: If sleepHours < 7, generate a tip about improving sleep. Set the 'context' field.
3.  **Hydration Second**: If sleep is okay, but water intake < 1500ml, generate a hydration tip. Set the 'context' field.
4.  **Activity Third**: If sleep and water are okay, but steps < 4000, generate a tip about light activity. Set the 'context' field.
5.  **General Tip**: If all logs are good or if there's no log data, generate a general health tip based on the user's goals. Do not set the 'context' field for general tips.

Keep the suggestion to a single, impactful sentence. The explanation should also be a single sentence.

${
  locale === 'bn'
    ? `Example (Low Sleep):
{
  "suggestion": "আজ রাতে একটু আগে ঘুমাতে যাওয়ার চেষ্টা করুন।",
  "explanation": "পর্যাপ্ত ঘুম আপনার শক্তি পুনরুদ্ধার করতে এবং মানসিক স্বাস্থ্যের উন্নতি করতে সাহায্য করে।",
  "context": "আপনার ঘুমের লগ অনুযায়ী"
}
Example (General):
{
  "suggestion": "আপনার দুপুরের খাবারে এক বাটি সালাদ যোগ করুন।",
  "explanation": "এটি আপনার খাবারে ফাইবার এবং প্রয়োজনীয় ভিটামিন যোগ করতে সাহায্য করবে।"
}`
    : `Example (Low Sleep):
{
  "suggestion": "Try to go to bed a little earlier tonight.",
  "explanation": "Getting enough sleep helps restore your energy and improves mental clarity.",
  "context": "Based on your sleep log"
}
Example (General):
{
  "suggestion": "Add a bowl of salad to your lunch.",
  "explanation": "This will help add fiber and essential vitamins to your meal."
}`
}
`,
    });

    const { output } = await prompt(input);
    return output!;
};


const generateHealthTipFlow = ai.defineFlow(
  {
    name: 'generateHealthTipFlow',
    inputSchema: GenerateHealthTipInputSchema,
    outputSchema: GenerateHealthTipOutputSchema,
  },
  async (input) => {
    const [bn, en] = await Promise.all([
        generateTipForLocale(input, 'bn'),
        generateTipForLocale(input, 'en')
    ]);
    return { bn, en };
  }
);


export async function generateHealthTip(input: GenerateHealthTipInput): Promise<GenerateHealthTipOutput> {
  return generateHealthTipFlow(input);
}
