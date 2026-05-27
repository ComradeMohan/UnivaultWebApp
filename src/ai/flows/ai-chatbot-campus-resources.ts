'use server';

/**
 * @fileOverview An AI chatbot for answering student questions about campus resources, deadlines, and academic information.
 *
 * - aiChatbotForCampusResources - A function that handles the chatbot interaction.
 * - AIChatbotForCampusResourcesInput - The input type for the aiChatbotForCampusResources function.
 * - AIChatbotForCampusResourcesOutput - The return type for the aiChatbotForCampusResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotForCampusResourcesInputSchema = z.object({
  question: z.string().describe('The question from the student.'),
});
export type AIChatbotForCampusResourcesInput = z.infer<typeof AIChatbotForCampusResourcesInputSchema>;

const AIChatbotForCampusResourcesOutputSchema = z.object({
  answer: z.string().describe('The answer to the student\'s question.'),
});
export type AIChatbotForCampusResourcesOutput = z.infer<typeof AIChatbotForCampusResourcesOutputSchema>;

export async function aiChatbotForCampusResources(input: AIChatbotForCampusResourcesInput): Promise<AIChatbotForCampusResourcesOutput> {
  return aiChatbotForCampusResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotForCampusResourcesPrompt',
  input: {schema: AIChatbotForCampusResourcesInputSchema},
  output: {schema: AIChatbotForCampusResourcesOutputSchema},
  prompt: `You are a helpful AI chatbot for university students. Your purpose is to answer questions about campus resources, deadlines, and academic information.

Question: {{{question}}}

Answer: `,
});

const aiChatbotForCampusResourcesFlow = ai.defineFlow(
  {
    name: 'aiChatbotForCampusResourcesFlow',
    inputSchema: AIChatbotForCampusResourcesInputSchema,
    outputSchema: AIChatbotForCampusResourcesOutputSchema,
  },
  async input => {
    // Dynamic runtime check to warn the developer or student of the missing API Key gracefully
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return {
        answer: "⚠️ **Developer Notice**: The Gemini API Key has not been configured in your environment variables. Please add a valid `GEMINI_API_KEY` to your `.env` configuration file in the project root folder to activate the interactive UniVault AI Campus Chatbot."
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
