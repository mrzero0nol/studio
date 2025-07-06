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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wand2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Theme } from "@/app/page";


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

const languageFormSchema = z.object({
    language: z.enum(["en", "id"]),
});

const themeFormSchema = z.object({
  theme: z.enum(["default", "sunset", "ocean", "forest"]),
});

interface SettingsFormProps {
  setAvatarUrl: (url: string) => void;
  setInteractionStyle: (style: string) => void;
  currentStyle: string;
  closeSheet: () => void;
  setBotName: (name: string) => void;
  currentBotName: string;
  setLanguage: (lang: 'en' | 'id') => void;
  currentLanguage: 'en' | 'id';
  handleClearChat: () => void;
  setTheme: (theme: Theme) => void;
  currentTheme: Theme;
}

const translations = {
    en: {
      avatarTitle: 'Avatar Generation',
      avatarDescriptionLabel: 'Avatar Description',
      avatarDescriptionPlaceholder: 'e.g., a wizard cat wearing a starry robe',
      avatarDescriptionHint: 'Describe the avatar you want to create.',
      generateAvatarButton: 'Generate Avatar',
      avatarGeneratedToast: 'Avatar Generated!',
      avatarGeneratedToastDesc: 'Your new avatar is ready.',
      avatarErrorToast: 'Uh oh! Something went wrong.',
      avatarErrorToastDesc: 'Could not generate the avatar. Please try again.',
      nameTitle: 'Bot Name',
      nameLabel: 'Bot Name',
      namePlaceholder: 'e.g., PersonaForge',
      nameHint: 'Give your bot a unique name.',
      saveNameButton: 'Save Name',
      nameUpdatedToast: 'Bot Name Updated!',
      nameUpdatedToastDesc: "The bot's name is now {name}.",
      styleTitle: 'Interaction Style',
      styleLabel: 'Bot Personality',
      stylePlaceholder: 'e.g., friendly and helpful',
      styleHint: 'How should the bot behave? (e.g., formal, witty, sarcastic)',
      saveStyleButton: 'Save Style',
      styleUpdatedToast: 'Interaction Style Updated!',
      styleUpdatedToastDesc: 'The bot will now respond in a {style} manner.',
      styleErrorToastDesc: 'Could not update the interaction style.',
      languageTitle: 'Language',
      languageLabel: 'Response Language',
      languageHint: 'Choose the language for the bot to respond in.',
      saveLanguageButton: 'Save Language',
      languageUpdatedToast: 'Language Updated!',
      languageUpdatedToastDesc: 'The bot will now respond in {language}.',
      english: 'English',
      indonesian: 'Indonesian',
      themeTitle: "UI Theme",
      themeLabel: "Select a theme",
      themeHint: "Customize the look and feel of the app.",
      saveThemeButton: "Save Theme",
      themeUpdatedToast: "Theme Updated!",
      themeUpdatedToastDesc: "The UI theme has been changed.",
      themeDefault: "Lavender (Default)",
      themeSunset: "Sunset Glow",
      themeOcean: "Ocean Breeze",
      themeForest: "Forest Whisper",
      dangerZoneTitle: "Clear Chat",
      clearChatButtonLabel: "Clear chat history",
      clearChatDialogTitle: "Are you absolutely sure?",
      clearChatDialogDescription: "This action cannot be undone. This will permanently delete your current conversation history.",
      dialogCancel: "Cancel",
      dialogConfirm: "Confirm & Clear",
    },
    id: {
      avatarTitle: 'Pembuatan Avatar',
      avatarDescriptionLabel: 'Deskripsi Avatar',
      avatarDescriptionPlaceholder: 'contoh: kucing penyihir berjubah bintang',
      avatarDescriptionHint: 'Jelaskan avatar yang ingin Anda buat.',
      generateAvatarButton: 'Buat Avatar',
      avatarGeneratedToast: 'Avatar Dibuat!',
      avatarGeneratedToastDesc: 'Avatar baru Anda sudah siap.',
      avatarErrorToast: 'Oh tidak! Terjadi kesalahan.',
      avatarErrorToastDesc: 'Tidak dapat membuat avatar. Silakan coba lagi.',
      nameTitle: 'Nama Bot',
      nameLabel: 'Nama Bot',
      namePlaceholder: 'contoh: PersonaForge',
      nameHint: 'Berikan nama unik untuk bot Anda.',
      saveNameButton: 'Simpan Nama',
      nameUpdatedToast: 'Nama Bot Diperbarui!',
      nameUpdatedToastDesc: 'Nama bot sekarang adalah {name}.',
      styleTitle: 'Gaya Interaksi',
      styleLabel: 'Kepribadian Bot',
      stylePlaceholder: 'contoh: ramah dan membantu',
      styleHint: 'Bagaimana bot harus berperilaku? (misalnya formal, jenaka, sarkastik)',
      saveStyleButton: 'Simpan Gaya',
      styleUpdatedToast: 'Gaya Interaksi Diperbarui!',
      styleUpdatedToastDesc: 'Bot sekarang akan merespons dengan gaya {style}.',
      styleErrorToastDesc: 'Tidak dapat memperbarui gaya interaksi.',
      languageTitle: 'Bahasa',
      languageLabel: 'Bahasa Respons',
      languageHint: 'Pilih bahasa respons bot.',
      saveLanguageButton: 'Simpan Bahasa',
      languageUpdatedToast: 'Bahasa Diperbarui!',
      languageUpdatedToastDesc: 'Bot sekarang akan merespons dalam {language}.',
      english: 'English',
      indonesian: 'Bahasa Indonesia',
      themeTitle: "Tema Tampilan",
      themeLabel: "Pilih sebuah tema",
      themeHint: "Ubahsuai tampilan aplikasi.",
      saveThemeButton: "Simpan Tema",
      themeUpdatedToast: "Tema Diperbarui!",
      themeUpdatedToastDesc: "Tema UI telah diubah.",
      themeDefault: "Lavender (Bawaan)",
      themeSunset: "Pijar Senja",
      themeOcean: "Angin Laut",
      themeForest: "Bisikan Hutan",
      dangerZoneTitle: "Bersihkan Chat",
      clearChatButtonLabel: "Bersihkan riwayat obrolan",
      clearChatDialogTitle: "Apakah Anda benar-benar yakin?",
      clearChatDialogDescription: "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus riwayat percakapan Anda saat ini secara permanen.",
      dialogCancel: "Batal",
      dialogConfirm: "Konfirmasi & Bersihkan",
    }
  };

export function SettingsForm({
  setAvatarUrl,
  setInteractionStyle,
  currentStyle,
  closeSheet,
  setBotName,
  currentBotName,
  setLanguage,
  currentLanguage,
  handleClearChat,
  setTheme,
  currentTheme,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isStyleLoading, setIsStyleLoading] = useState(false);
  
  const t = translations[currentLanguage];

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

  const languageForm = useForm<z.infer<typeof languageFormSchema>>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      language: currentLanguage,
    },
  });

  const themeForm = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      theme: currentTheme,
    },
  });

  async function onAvatarSubmit(values: z.infer<typeof avatarFormSchema>) {
    setIsAvatarLoading(true);
    try {
      const result = await createAvatar({ description: values.description });
      if (result.error) {
        toast({
          variant: "destructive",
          title: t.avatarErrorToast,
          description: result.error,
        });
      } else if (result.avatarDataUri) {
        setAvatarUrl(result.avatarDataUri);
        toast({
          title: t.avatarGeneratedToast,
          description: t.avatarGeneratedToastDesc,
        });
        closeSheet();
      } else {
        toast({
          variant: "destructive",
          title: t.avatarErrorToast,
          description: t.avatarErrorToastDesc,
        });
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
      toast({
        variant: "destructive",
        title: t.avatarErrorToast,
        description: error instanceof Error ? error.message : t.avatarErrorToastDesc,
      });
    } finally {
      setIsAvatarLoading(false);
    }
  }
  
  function onNameSubmit(values: z.infer<typeof nameFormSchema>) {
    setBotName(values.name);
    toast({
      title: t.nameUpdatedToast,
      description: t.nameUpdatedToastDesc.replace('{name}', values.name),
    });
    closeSheet();
  }

  async function onStyleSubmit(values: z.infer<typeof styleFormSchema>) {
    setIsStyleLoading(true);
    try {
      const result = await setStyle({ interactionStyle: values.style });
      setInteractionStyle(result.configuredStyle);
      toast({
        title: t.styleUpdatedToast,
        description: t.styleUpdatedToastDesc.replace('{style}', result.configuredStyle),
      });
      closeSheet();
    } catch (error) {
      console.error("Style configuration failed:", error);
      toast({
        variant: "destructive",
        title: t.avatarErrorToast,
        description: t.styleErrorToastDesc,
      });
    } finally {
      setIsStyleLoading(false);
    }
  }

  function onLanguageSubmit(values: z.infer<typeof languageFormSchema>) {
    setLanguage(values.language);
    toast({
      title: t.languageUpdatedToast,
      description: t.languageUpdatedToastDesc.replace('{language}', values.language === 'en' ? t.english : t.indonesian),
    });
    closeSheet();
  }

  function onThemeSubmit(values: z.infer<typeof themeFormSchema>) {
    setTheme(values.theme);
    toast({
      title: t.themeUpdatedToast,
      description: t.themeUpdatedToastDesc,
    });
    closeSheet();
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="avatar">
      <AccordionItem value="avatar">
        <AccordionTrigger className="text-lg">{t.avatarTitle}</AccordionTrigger>
        <AccordionContent>
          <Form {...avatarForm}>
            <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-6">
              <FormField
                control={avatarForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.avatarDescriptionLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.avatarDescriptionPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t.avatarDescriptionHint}
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
                {t.generateAvatarButton}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="name">
        <AccordionTrigger className="text-lg">{t.nameTitle}</AccordionTrigger>
        <AccordionContent>
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-6">
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.nameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.namePlaceholder} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t.nameHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t.saveNameButton}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="style">
        <AccordionTrigger className="text-lg">{t.styleTitle}</AccordionTrigger>
        <AccordionContent>
          <Form {...styleForm}>
            <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-6">
              <FormField
                control={styleForm.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.styleLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.stylePlaceholder} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t.styleHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isStyleLoading} className="w-full">
                {isStyleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.saveStyleButton}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="language">
        <AccordionTrigger className="text-lg">{t.languageTitle}</AccordionTrigger>
        <AccordionContent>
          <Form {...languageForm}>
            <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-6">
              <FormField
                control={languageForm.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t.languageLabel}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="en" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.english}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="id" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.indonesian}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      {t.languageHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t.saveLanguageButton}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
       <AccordionItem value="theme">
        <AccordionTrigger className="text-lg">{t.themeTitle}</AccordionTrigger>
        <AccordionContent>
          <Form {...themeForm}>
            <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
              <FormField
                control={themeForm.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t.themeLabel}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="default" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.themeDefault}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sunset" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.themeSunset}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ocean" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.themeOcean}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="forest" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t.themeForest}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      {t.themeHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t.saveThemeButton}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="danger">
        <AccordionTrigger className="text-lg text-destructive/90 hover:text-destructive">{t.dangerZoneTitle}</AccordionTrigger>
        <AccordionContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                {t.clearChatButtonLabel}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.clearChatDialogTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.clearChatDialogDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.dialogCancel}</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    handleClearChat();
                    closeSheet();
                  }}>
                  {t.dialogConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
