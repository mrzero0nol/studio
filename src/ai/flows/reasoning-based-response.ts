'use server';

/**
 * @fileOverview A flow to generate responses based on reasoning that considers the context of the input and configured character settings.
 *
 * - reasoningBasedResponse - A function that generates a response based on reasoning.
 * - ReasoningBasedResponseInput - The input type for the reasoningBasedResponse function.
 * - ReasoningBasedResponseOutput - The return type for the reasoningBasedResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasoningBasedResponseInputSchema = z.object({
  userInput: z.string().describe('The user input to respond to.'),
  characterSettings: z.string().describe('The configured character settings, such as personality and interaction style.'),
  chatHistory: z.string().optional().describe('The chat history to provide context for the response.'),
});
export type ReasoningBasedResponseInput = z.infer<typeof ReasoningBasedResponseInputSchema>;

const ReasoningBasedResponseOutputSchema = z.object({
  response: z.string().describe('The generated response based on reasoning.'),
});
export type ReasoningBasedResponseOutput = z.infer<typeof ReasoningBasedResponseOutputSchema>;

export async function reasoningBasedResponse(input: ReasoningBasedResponseInput): Promise<ReasoningBasedResponseOutput> {
  return reasoningBasedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningBasedResponsePrompt',
  input: {schema: ReasoningBasedResponseInputSchema},
  output: {schema: ReasoningBasedResponseOutputSchema},
  prompt: `You are a chatbot with the following character settings: {{{characterSettings}}}.

  Consider the following chat history: {{{chatHistory}}}.

  Based on the above character settings and chat history, respond to the following user input with reasoning:

  {{{userInput}}}
  `,
});

const reasoningBasedResponseFlow = ai.defineFlow(
  {
    name: 'reasoningBasedResponseFlow',
    inputSchema: ReasoningBasedResponseInputSchema,
    outputSchema: ReasoningBasedResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
