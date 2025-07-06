"use server";

import { generateAvatar } from "@/ai/flows/generate-avatar";
import { configureInteractionStyle } from "@/ai/flows/configure-interaction-style";
import { reasoningBasedResponse } from "@/ai/flows/reasoning-based-response";
import { z } from "zod";

const reasoningSchema = z.object({
  userInput: z.string(),
  characterSettings: z.string(),
  chatHistory: z.string(),
  language: z.string(),
  storyMode: z.boolean(),
});

export const getResponse = async (input: z.infer<typeof reasoningSchema>) => {
  const validatedInput = reasoningSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input");
  }
  return await reasoningBasedResponse(validatedInput.data);
};

const avatarSchema = z.object({
  description: z.string(),
});

export const createAvatar = async (input: z.infer<typeof avatarSchema>) => {
  const validatedInput = avatarSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input");
  }
  return await generateAvatar(validatedInput.data);
};

const styleSchema = z.object({
  interactionStyle: z.string(),
});

export const setStyle = async (input: z.infer<typeof styleSchema>) => {
  const validatedInput = styleSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input");
  }
  return await configureInteractionStyle(validatedInput.data);
};
