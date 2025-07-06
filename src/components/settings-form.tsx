"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAvatar, setStyle } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Wand2 } from "lucide-react";

const avatarFormSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const nameFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be empty.",
  }).max(20, {
    message: "Name cannot be longer than 20 characters.",
  }),
});

const styleFormSchema = z.object({
  style: z.string().min(5, {
    message: "Style must be at least 5 characters.",
  }),
});

interface SettingsFormProps {
  setAvatarUrl: (url: string) => void;
  setInteractionStyle: (style: string) => void;
  currentStyle: string;
  closeSheet: () => void;
  setBotName: (name: string) => void;
  currentBotName: string;
}

export function SettingsForm({
  setAvatarUrl,
  setInteractionStyle,
  currentStyle,
  closeSheet,
  setBotName,
  currentBotName,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isStyleLoading, setIsStyleLoading] = useState(false);

  const avatarForm = useForm<z.infer<typeof avatarFormSchema>>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      description: "A friendly, futuristic robot with a purple and blue color scheme.",
    },
  });

  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: currentBotName,
    },
  });

  const styleForm = useForm<z.infer<typeof styleFormSchema>>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
      style: currentStyle,
    },
  });

  async function onAvatarSubmit(values: z.infer<typeof avatarFormSchema>) {
    setIsAvatarLoading(true);
    try {
      const result = await createAvatar({ description: values.description });
      setAvatarUrl(result.avatarDataUri);
      toast({
        title: "Avatar Generated!",
        description: "Your new avatar is ready.",
      });
      closeSheet();
    } catch (error) {
      console.error("Avatar generation failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not generate the avatar. Please try again.",
      });
    } finally {
      setIsAvatarLoading(false);
    }
  }
  
  function onNameSubmit(values: z.infer<typeof nameFormSchema>) {
    setBotName(values.name);
    toast({
      title: "Bot Name Updated!",
      description: `The bot's name is now ${values.name}.`,
    });
    closeSheet();
  }

  async function onStyleSubmit(values: z.infer<typeof styleFormSchema>) {
    setIsStyleLoading(true);
    try {
      const result = await setStyle({ interactionStyle: values.style });
      setInteractionStyle(result.configuredStyle);
      toast({
        title: "Interaction Style Updated!",
        description: `The bot will now respond in a ${result.configuredStyle} manner.`,
      });
      closeSheet();
    } catch (error) {
      console.error("Style configuration failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not update the interaction style.",
      });
    } finally {
      setIsStyleLoading(false);
    }
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="avatar">
      <AccordionItem value="avatar">
        <AccordionTrigger className="text-lg">Avatar Generation</AccordionTrigger>
        <AccordionContent>
          <Form {...avatarForm}>
            <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-6">
              <FormField
                control={avatarForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., a wizard cat wearing a starry robe"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the avatar you want to create.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isAvatarLoading} className="w-full">
                {isAvatarLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Avatar
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="name">
        <AccordionTrigger className="text-lg">Bot Name</AccordionTrigger>
        <AccordionContent>
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-6">
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PersonaForge" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your bot a unique name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Name
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="style">
        <AccordionTrigger className="text-lg">Interaction Style</AccordionTrigger>
        <AccordionContent>
          <Form {...styleForm}>
            <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-6">
              <FormField
                control={styleForm.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Personality</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., friendly and helpful" {...field} />
                    </FormControl>
                    <FormDescription>
                      How should the bot behave? (e.g., formal, witty, sarcastic)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isStyleLoading} className="w-full">
                {isStyleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Style
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
