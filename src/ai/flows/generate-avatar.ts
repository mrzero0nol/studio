
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
  negativePrompt: z
    .string()
    .optional()
    .describe('A description of elements to avoid in the avatar.'),
});

export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .optional()
    .describe(
      "The avatar image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  error: z.string().optional().describe('An error message if generation failed.'),
});

export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarPrompt = ai.definePrompt({
  name: 'generateAvatarPrompt',
  input: {schema: GenerateAvatarInputSchema},
  output: {schema: GenerateAvatarOutputSchema},
  prompt: `Create a high-quality, detailed, and clear avatar with a resolution of 512x512 pixels. The image must be a square (1:1 aspect ratio) and visually impressive, suitable for a profile picture. Base the avatar on the following description: {{{description}}}. {{#if negativePrompt}}Do not include the following: {{{negativePrompt}}}.{{/if}} Return the image as a data URI.`,
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
    let fullPrompt = `Create a photorealistic, high-quality, detailed, and clear avatar of a real human. The image must be a square (1:1 aspect ratio) with a resolution of 512x512 pixels, suitable for a profile picture. The generated person should look like a real, lifelike human. Base the avatar on the following description: ${input.description}`;

    if (input.negativePrompt) {
      fullPrompt += `. --- IMPORTANT: Do not include any of the following elements or styles: ${input.negativePrompt}`;
    }

    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',

      prompt: fullPrompt,

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
      return { error: "Image generation failed. It's possible the prompt was rejected for safety reasons. Please try a different description." };
    }

    return {avatarDataUri: media.url};
  }
);
