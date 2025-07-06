// src/ai/flows/generate-avatar.ts
'use server';
/**
 * @fileOverview Avatar generation flow.
 *
 * - generateAvatar - A function that generates an avatar based on user preferences.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.object({
  description: z.string().describe('Description of the desired avatar.'),
});

export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      'The avatar image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});

export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarPrompt = ai.definePrompt({
  name: 'generateAvatarPrompt',
  input: {schema: GenerateAvatarInputSchema},
  output: {schema: GenerateAvatarOutputSchema},
  prompt: `Generate an avatar image based on the following description: {{{description}}}.  Return the image as a data URI.`, 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',

      prompt: input.description,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });

    if (!media?.url) {
      throw new Error("Image generation failed. It's possible the prompt was rejected for safety reasons. Please try a different description.");
    }

    return {avatarDataUri: media.url};
  }
);
