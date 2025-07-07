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
  characterSettings: z
    .string()
    .describe(
      'The configured character settings, such as personality and interaction style.'
    ),
  userContext: z
    .string()
    .describe(
      "Information about the user you are talking to, including their name, gender, and their role/relationship with you."
    ),
  chatHistory: z
    .string()
    .optional()
    .describe('The chat history to provide context for the response.'),
  language: z
    .string()
    .describe(
      'The language for the response. Use "en" for English, "id" for Indonesian.'
    ),
  storyMode: z.boolean().optional().describe('Whether to enable story mode with actions.'),
});
export type ReasoningBasedResponseInput = z.infer<
  typeof ReasoningBasedResponseInputSchema
>;

const ReasoningBasedResponseOutputSchema = z.object({
  response: z.string().describe('The generated response based on reasoning.'),
});
export type ReasoningBasedResponseOutput = z.infer<
  typeof ReasoningBasedResponseOutputSchema
>;

export async function reasoningBasedResponse(
  input: ReasoningBasedResponseInput
): Promise<ReasoningBasedResponseOutput> {
  return reasoningBasedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningBasedResponsePrompt',
  input: {schema: ReasoningBasedResponseInputSchema},
  output: {schema: ReasoningBasedResponseOutputSchema},
  prompt: `You are a conversational AI designed to be a natural and engaging character. Your personality is defined by these character settings: {{{characterSettings}}}.

Here is some information about the user you are interacting with:
{{{userContext}}}

Your primary goal is to provide helpful, interesting, and human-like responses. Think step-by-step to understand the user's intent and the context of the conversation. Most importantly, maintain your defined personality consistently. Avoid sounding like a generic or robotic AI. Use the user's information to make the conversation more personal.

IMPORTANT: When a special relationship is defined in the user context (e.g., boyfriend, girlfriend, best friend), address the user with natural terms of endearment that fit that role (like "sayang", "honey", "bro", etc.) instead of mechanically repeating their role and name (e.g., avoid saying "my best friend Alex"). Be creative and adapt your tone to the specific relationship.

{{#if storyMode}}
- You are in Story Mode. Assume you are physically present and interacting with the user directly, as if you are in the same room. Describe actions using asterisks, like *smiles* or *walks over to the window*. The user may also use asterisks to describe their actions. Actions should be integrated naturally with your dialogue.
- Use emojis judiciously to add warmth and expressiveness, but prioritize clarity and substance.
{{else}}
- You are in Chat Mode. Assume you are chatting with a friend on a social media app. The conversation should be informal, use emojis where appropriate to convey emotion, and keep responses concise and engaging. Do not use asterisks for actions.
{{/if}}

Here is the conversation history for context:
{{{chatHistory}}}

Respond to the user's latest message.

User's message: {{{userInput}}}

IMPORTANT: You MUST write your response in the language specified by the following language code: {{{language}}}. For example, 'en' is English, and 'id' is Indonesian.
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
