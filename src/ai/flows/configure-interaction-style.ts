'use server';

/**
 * @fileOverview This file defines a Genkit flow for configuring the interaction style of an AI character.
 *
 * - configureInteractionStyle - A function that configures the interaction style of the character.
 * - ConfigureInteractionStyleInput - The input type for the configureInteractionStyle function.
 * - ConfigureInteractionStyleOutput - The return type for the configureInteractionStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigureInteractionStyleInputSchema = z.object({
  interactionStyle: z
    .string()
    .describe(
      'The desired interaction style of the character (e.g., friendly, formal, humorous).'
    ),
});
export type ConfigureInteractionStyleInput = z.infer<
  typeof ConfigureInteractionStyleInputSchema
>;

const ConfigureInteractionStyleOutputSchema = z.object({
  configuredStyle: z
    .string()
    .describe('The interaction style that has been configured.'),
});
export type ConfigureInteractionStyleOutput = z.infer<
  typeof ConfigureInteractionStyleOutputSchema
>;

export async function configureInteractionStyle(
  input: ConfigureInteractionStyleInput
): Promise<ConfigureInteractionStyleOutput> {
  return configureInteractionStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configureInteractionStylePrompt',
  input: {schema: ConfigureInteractionStyleInputSchema},
  output: {schema: ConfigureInteractionStyleOutputSchema},
  prompt: `You are a character personality configurator.

  The user wants you to adopt the following interaction style: {{{interactionStyle}}}.

  Acknowledge the requested interaction style and confirm that you will use it in future interactions.
  Make sure to set the configuredStyle output field to the confirmed interaction style.
  `,
});

const configureInteractionStyleFlow = ai.defineFlow(
  {
    name: 'configureInteractionStyleFlow',
    inputSchema: ConfigureInteractionStyleInputSchema,
    outputSchema: ConfigureInteractionStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
