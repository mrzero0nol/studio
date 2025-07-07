
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wand2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Theme } from "@/app/page";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const avatarFormSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const nameFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be empty.",
  }).max(30, {
    message: "Name cannot be longer than 30 characters.",
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
  currentAvatarUrl: string;
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
  setStoryMode: (enabled: boolean) => void;
  currentStoryMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  currentDarkMode: boolean;
}

const translations = {
    en: {
      currentAvatar: 'Current Avatar',
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
      namePlaceholder: 'e.g., Custom Chat Character',
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
      storyModeTitle: "Story Mode",
      storyModeLabel: "Enable Story Mode",
      storyModeHint: "Allows the bot to use narrative actions, like *smiles*.",
      dangerZoneTitle: "Clear Chat",
      clearChatButtonLabel: "Clear chat history",
      clearChatDialogTitle: "Are you absolutely sure?",
      clearChatDialogDescription: "This action cannot be undone. This will permanently delete your current conversation history.",
      dialogCancel: "Cancel",
      dialogConfirm: "Confirm & Clear",
      characterSettingsTitle: 'Character',
      generalSettingsTitle: 'General',
      darkModeTitle: "Dark Mode",
      darkModeLabel: "Enable Dark Mode",
      darkModeHint: "Reduces eye strain in low light.",
    },
    id: {
      currentAvatar: 'Avatar Saat Ini',
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
      namePlaceholder: 'contoh: Custom Chat Character',
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
      storyModeTitle: "Mode Cerita",
      storyModeLabel: "Aktifkan Mode Cerita",
      storyModeHint: "Izinkan bot menggunakan tindakan naratif, seperti *tersenyum*.",
      dangerZoneTitle: "Bersihkan Chat",
      clearChatButtonLabel: "Bersihkan riwayat obrolan",
      clearChatDialogTitle: "Apakah Anda benar-benar yakin?",
      clearChatDialogDescription: "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus riwayat percakapan Anda saat ini secara permanen.",
      dialogCancel: "Batal",
      dialogConfirm: "Konfirmasi & Bersihkan",
      characterSettingsTitle: 'Karakter',
      generalSettingsTitle: 'Umum',
      darkModeTitle: "Mode Gelap",
      darkModeLabel: "Aktifkan Mode Gelap",
      darkModeHint: "Mengurangi ketegangan mata dalam cahaya redup.",
    }
  };

export function SettingsForm({
  currentAvatarUrl,
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
  setStoryMode,
  currentStoryMode,
  setDarkMode,
  currentDarkMode,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isStyleLoading, setIsStyleLoading] = useState(false);
  
  const t = translations[currentLanguage];
  const botInitials = currentBotName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

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
    <Tabs defaultValue="character" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="character">{t.characterSettingsTitle}</TabsTrigger>
        <TabsTrigger value="general">{t.generalSettingsTitle}</TabsTrigger>
      </TabsList>
      <TabsContent value="character">
        <div className="space-y-4 pt-4">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.avatarTitle}</h3>
            <div className="flex flex-col items-center gap-2 pt-2 pb-4">
              <Label htmlFor="avatar-preview">{t.currentAvatar}</Label>
              <Avatar id="avatar-preview" className="w-24 h-24 border-2 border-primary/50">
                <AvatarImage src={currentAvatarUrl} alt="Current Avatar" data-ai-hint="robot avatar" />
                <AvatarFallback>{botInitials}</AvatarFallback>
              </Avatar>
            </div>
            <Form {...avatarForm}>
              <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-4">
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
                      <p className="text-sm text-muted-foreground">
                        {t.avatarDescriptionHint}
                      </p>
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
          </div>

          {/* Bot Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.nameTitle}</h3>
            <Form {...nameForm}>
              <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
                <FormField
                  control={nameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.nameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.namePlaceholder} {...field} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {t.nameHint}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {t.saveNameButton}
                </Button>
              </form>
            </Form>
          </div>

          {/* Interaction Style Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.styleTitle}</h3>
            <Form {...styleForm}>
              <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-4">
                <FormField
                  control={styleForm.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.styleLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.stylePlaceholder} {...field} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {t.styleHint}
                      </p>
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
          </div>
        </div>
      </TabsContent>
      <TabsContent value="general">
        <div className="space-y-4 pt-4">
          {/* Clear Chat Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-destructive/90">{t.dangerZoneTitle}</h3>
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
                  <p className="text-sm text-muted-foreground">
                    {t.clearChatDialogDescription}
                  </p>
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
          </div>
          
          {/* Story Mode Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.storyModeTitle}</h3>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="story-mode-switch" className="text-base">{t.storyModeLabel}</Label>
                  <p className="text-sm text-muted-foreground">{t.storyModeHint}</p>
                </div>
                <Switch
                  id="story-mode-switch"
                  checked={currentStoryMode}
                  onCheckedChange={setStoryMode}
                />
              </div>
          </div>

          {/* Dark Mode Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.darkModeTitle}</h3>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode-switch" className="text-base">{t.darkModeLabel}</Label>
                  <p className="text-sm text-muted-foreground">{t.darkModeHint}</p>
                </div>
                <Switch
                  id="dark-mode-switch"
                  checked={currentDarkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
          </div>

          {/* Language Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.languageTitle}</h3>
            <Form {...languageForm}>
              <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-4">
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
                      <p className="text-sm text-muted-foreground">
                        {t.languageHint}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {t.saveLanguageButton}
                </Button>
              </form>
            </Form>
          </div>

          {/* UI Theme Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.themeTitle}</h3>
            <Form {...themeForm}>
              <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
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
                      <p className="text-sm text-muted-foreground">
                        {t.themeHint}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {t.saveThemeButton}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
