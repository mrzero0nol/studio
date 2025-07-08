
"use client";

import { useState, useRef } from "react";
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
import { Loader2, Wand2, Trash2, Upload, Download } from "lucide-react";
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
  negativePrompt: z.string().optional(),
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

const userNameFormSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(30, "Name cannot be longer than 30 characters."),
});

const userGenderFormSchema = z.object({
  gender: z.enum(["male", "female", "not_specified"]),
});

const userRoleFormSchema = z.object({
  role: z.string().min(5, "Role must be at least 5 characters."),
});

interface SettingsFormProps {
  currentAvatarUrl: string;
  setAvatarUrl: (url: string) => void;
  setInteractionStyle: (style: string) => void;
  currentStyle: string;
  setCharacterName: (name: string) => void;
  currentCharacterName: string;
  setLanguage: (lang: 'en' | 'id') => void;
  currentLanguage: 'en' | 'id';
  handleClearChat: () => void;
  setTheme: (theme: Theme) => void;
  currentTheme: Theme;
  setStoryMode: (enabled: boolean) => void;
  currentStoryMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  currentDarkMode: boolean;
  currentAvatarDescription: string;
  setAvatarDescription: (description: string) => void;
  currentAvatarNegativePrompt: string;
  setAvatarNegativePrompt: (prompt: string) => void;
  setUserName: (name: string) => void;
  currentUserName: string;
  setUserGender: (gender: string) => void;
  currentUserGender: string;
  setUserRole: (role: string) => void;
  currentUserRole: string;
}

const translations = {
    en: {
      currentAvatar: 'Current Avatar',
      avatarTitle: 'Avatar Generation',
      avatarDescriptionLabel: 'Avatar Description',
      avatarDescriptionPlaceholder: 'e.g., a wizard cat wearing a starry robe',
      avatarDescriptionHint: 'Describe the avatar you want to create.',
      negativePromptLabel: 'Negative Prompt',
      negativePromptPlaceholder: 'e.g., blurry, text, watermark, extra limbs',
      negativePromptHint: 'Describe elements to exclude from the avatar.',
      generateAvatarButton: 'Generate Avatar',
      avatarGeneratedToast: 'Avatar Generated!',
      avatarGeneratedToastDesc: 'Your new avatar is ready.',
      avatarErrorToast: 'Uh oh! Something went wrong.',
      avatarErrorToastDesc: 'Could not generate the avatar. Please try again.',
      nameTitle: 'Character Name',
      nameLabel: 'Character Name',
      namePlaceholder: 'e.g., Custom Chat Character',
      nameHint: 'Give your character a unique name.',
      saveNameButton: 'Save Name',
      nameUpdatedToast: 'Character Name Updated!',
      nameUpdatedToastDesc: "The character's name is now {name}.",
      styleTitle: 'Interaction Style',
      styleLabel: 'Character Personality',
      stylePlaceholder: 'e.g., friendly and helpful',
      styleHint: 'How should the character behave? (e.g., formal, witty, sarcastic)',
      saveStyleButton: 'Save Style',
      styleUpdatedToast: 'Interaction Style Updated!',
      styleUpdatedToastDesc: 'The character will now respond in a {style} manner.',
      styleErrorToastDesc: 'Could not update the interaction style.',
      languageTitle: 'Language',
      languageLabel: 'Response Language',
      languageHint: 'Choose the language for the character to respond in.',
      saveLanguageButton: 'Save Language',
      languageUpdatedToast: 'Language Updated!',
      languageUpdatedToastDesc: 'The character will now respond in {language}.',
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
      storyModeHint: "Allows the character to use narrative actions, like *smiles*.",
      dangerZoneTitle: "Clear Chat",
      clearChatButtonLabel: "Clear chat history",
      clearChatDialogTitle: "Are you absolutely sure?",
      clearChatDialogDescription: "This action cannot be undone. This will permanently delete your current conversation history.",
      dialogCancel: "Cancel",
      dialogConfirm: "Confirm & Clear",
      characterSettingsTitle: 'Character',
      userSettingsTitle: 'User',
      generalSettingsTitle: 'General',
      darkModeTitle: "Dark Mode",
      darkModeLabel: "Enable Dark Mode",
      darkModeHint: "Reduces eye strain in low light.",
      userNameTitle: 'Your Name',
      userNameLabel: 'Your Name',
      userNamePlaceholder: 'e.g., Alex',
      userNameHint: 'This is how the character will refer to you.',
      saveUserNameButton: 'Save Name',
      userNameUpdatedToast: 'Name Updated!',
      userNameUpdatedToastDesc: "The character will now call you {name}.",
      userGenderTitle: 'Your Gender',
      userGenderLabel: 'Select your gender',
      userGenderHint: 'This helps the character use the correct pronouns.',
      saveUserGenderButton: 'Save Gender',
      userGenderUpdatedToast: 'Gender Updated!',
      userGenderUpdatedToastDesc: 'Your gender has been set.',
      male: 'Male',
      female: 'Female',
      notSpecified: 'Prefer not to say',
      userRoleTitle: 'Your Role',
      userRoleLabel: 'Relationship with character',
      userRolePlaceholder: 'e.g., my best friend, my mentor, my partner in crime',
      userRoleHint: 'Define your relationship with the character. Be creative!',
      saveUserRoleButton: 'Save Role',
      userRoleUpdatedToast: 'Role Updated!',
      userRoleUpdatedToastDesc: 'Your role has been set.',
      uploadAvatarTitle: 'Upload & Download',
      uploadAvatarButton: 'Upload Avatar',
      downloadAvatarButton: 'Download Avatar',
      uploadAvatarHint: 'Upload an image from your computer.',
      downloadAvatarHint: 'Download the current avatar.',
      uploadSuccessToast: 'Avatar Uploaded!',
      uploadSuccessToastDesc: 'Your new avatar has been set.',
      uploadErrorToast: 'Upload Failed',
      uploadErrorToastDesc: 'Please select a valid image file.',
    },
    id: {
      currentAvatar: 'Avatar Saat Ini',
      avatarTitle: 'Pembuatan Avatar',
      avatarDescriptionLabel: 'Deskripsi Avatar',
      avatarDescriptionPlaceholder: 'contoh: kucing penyihir berjubah bintang',
      avatarDescriptionHint: 'Jelaskan avatar yang ingin Anda buat.',
      negativePromptLabel: 'Prompt Negatif',
      negativePromptPlaceholder: 'contoh: buram, teks, watermark, anggota tubuh tambahan',
      negativePromptHint: 'Jelaskan elemen yang tidak ingin disertakan di avatar.',
      generateAvatarButton: 'Buat Avatar',
      avatarGeneratedToast: 'Avatar Dibuat!',
      avatarGeneratedToastDesc: 'Avatar baru Anda sudah siap.',
      avatarErrorToast: 'Oh tidak! Terjadi kesalahan.',
      avatarErrorToastDesc: 'Tidak dapat membuat avatar. Silakan coba lagi.',
      nameTitle: 'Nama Karakter',
      nameLabel: 'Nama Karakter',
      namePlaceholder: 'contoh: Custom Chat Character',
      nameHint: 'Berikan nama unik untuk karakter Anda.',
      saveNameButton: 'Simpan Nama',
      nameUpdatedToast: 'Nama Karakter Diperbarui!',
      nameUpdatedToastDesc: 'Nama karakter sekarang adalah {name}.',
      styleTitle: 'Gaya Interaksi',
      styleLabel: 'Kepribadian Karakter',
      stylePlaceholder: 'contoh: ramah dan membantu',
      styleHint: 'Bagaimana karakter harus berperilaku? (misalnya formal, jenaka, sarkastik)',
      saveStyleButton: 'Simpan Gaya',
      styleUpdatedToast: 'Gaya Interaksi Diperbarui!',
      styleUpdatedToastDesc: 'Karakter sekarang akan merespons dengan gaya {style}.',
      styleErrorToastDesc: 'Tidak dapat memperbarui gaya interaksi.',
      languageTitle: 'Bahasa',
      languageLabel: 'Bahasa Respons',
      languageHint: 'Pilih bahasa respons karakter.',
      saveLanguageButton: 'Simpan Bahasa',
      languageUpdatedToast: 'Bahasa Diperbarui!',
      languageUpdatedToastDesc: 'Karakter sekarang akan merespons dalam {language}.',
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
      storyModeHint: "Izinkan karakter menggunakan tindakan naratif, seperti *tersenyum*.",
      dangerZoneTitle: "Bersihkan Chat",
      clearChatButtonLabel: "Bersihkan riwayat obrolan",
      clearChatDialogTitle: "Apakah Anda benar-benar yakin?",
      clearChatDialogDescription: "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus riwayat percakapan Anda saat ini secara permanen.",
      dialogCancel: "Batal",
      dialogConfirm: "Konfirmasi & Bersihkan",
      characterSettingsTitle: 'Karakter',
      userSettingsTitle: 'Pengguna',
      generalSettingsTitle: 'Umum',
      darkModeTitle: "Mode Gelap",
      darkModeLabel: "Aktifkan Mode Gelap",
      darkModeHint: "Mengurangi ketegangan mata dalam cahaya redup.",
      userNameTitle: 'Nama Anda',
      userNameLabel: 'Nama Anda',
      userNamePlaceholder: 'contoh: Alex',
      userNameHint: 'Ini adalah bagaimana karakter akan memanggil Anda.',
      saveUserNameButton: 'Simpan Nama',
      userNameUpdatedToast: 'Nama Diperbarui!',
      userNameUpdatedToastDesc: "Karakter sekarang akan memanggil Anda {name}.",
      userGenderTitle: 'Jenis Kelamin Anda',
      userGenderLabel: 'Pilih jenis kelamin Anda',
      userGenderHint: 'Ini membantu karakter menggunakan kata ganti yang benar.',
      saveUserGenderButton: 'Simpan Jenis Kelamin',
      userGenderUpdatedToast: 'Jenis Kelamin Diperbarui!',
      userGenderUpdatedToastDesc: 'Jenis kelamin Anda telah diatur.',
      male: 'Pria',
      female: 'Wanita',
      notSpecified: 'Tidak ingin menyebutkan',
      userRoleTitle: 'Peran Anda',
      userRoleLabel: 'Hubungan dengan karakter',
      userRolePlaceholder: 'contoh: sahabatku, mentorku, rekan kejahatanku',
      userRoleHint: 'Tentukan hubungan Anda dengan karakter. Berkreasilah!',
      saveUserRoleButton: 'Simpan Peran',
      userRoleUpdatedToast: 'Peran Diperbarui!',
      userRoleUpdatedToastDesc: 'Peran Anda telah diatur.',
      uploadAvatarTitle: 'Unggah & Unduh',
      uploadAvatarButton: 'Unggah Avatar',
      downloadAvatarButton: 'Unduh Avatar',
      uploadAvatarHint: 'Unggah gambar dari komputer Anda.',
      downloadAvatarHint: 'Unduh avatar saat ini.',
      uploadSuccessToast: 'Avatar Diunggah!',
      uploadSuccessToastDesc: 'Avatar baru Anda telah ditetapkan.',
      uploadErrorToast: 'Gagal Mengunggah',
      uploadErrorToastDesc: 'Silakan pilih file gambar yang valid.',
    }
  };

export function SettingsForm({
  currentAvatarUrl,
  setAvatarUrl,
  setInteractionStyle,
  currentStyle,
  setCharacterName,
  currentCharacterName,
  setLanguage,
  currentLanguage,
  handleClearChat,
  setTheme,
  currentTheme,
  setStoryMode,
  currentStoryMode,
  setDarkMode,
  currentDarkMode,
  currentAvatarDescription,
  setAvatarDescription,
  currentAvatarNegativePrompt,
  setAvatarNegativePrompt,
  setUserName,
  currentUserName,
  setUserGender,
  currentUserGender,
  setUserRole,
  currentUserRole,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isStyleLoading, setIsStyleLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[currentLanguage];
  const characterInitials = currentCharacterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const avatarForm = useForm<z.infer<typeof avatarFormSchema>>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      description: currentAvatarDescription,
      negativePrompt: currentAvatarNegativePrompt,
    },
  });

  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: currentCharacterName,
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

  const userNameForm = useForm<z.infer<typeof userNameFormSchema>>({
    resolver: zodResolver(userNameFormSchema),
    defaultValues: { name: currentUserName },
  });

  const userGenderForm = useForm<z.infer<typeof userGenderFormSchema>>({
    resolver: zodResolver(userGenderFormSchema),
    defaultValues: { gender: currentUserGender as "male" | "female" | "not_specified" },
  });

  const userRoleForm = useForm<z.infer<typeof userRoleFormSchema>>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: { role: currentUserRole },
  });

  async function onAvatarSubmit(values: z.infer<typeof avatarFormSchema>) {
    setIsAvatarLoading(true);
    try {
      const result = await createAvatar({ description: values.description, negativePrompt: values.negativePrompt });
      if (result.error) {
        toast({
          variant: "destructive",
          title: t.avatarErrorToast,
          description: result.error,
        });
      } else if (result.avatarDataUri) {
        setAvatarUrl(result.avatarDataUri);
        setAvatarDescription(values.description);
        setAvatarNegativePrompt(values.negativePrompt || "");
        toast({
          title: t.avatarGeneratedToast,
          description: t.avatarGeneratedToastDesc,
        });
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
    setCharacterName(values.name);
    toast({
      title: t.nameUpdatedToast,
      description: t.nameUpdatedToastDesc.replace('{name}', values.name),
    });
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
  }

  function onThemeSubmit(values: z.infer<typeof themeFormSchema>) {
    setTheme(values.theme);
    toast({
      title: t.themeUpdatedToast,
      description: t.themeUpdatedToastDesc,
    });
  }

  function onUserNameSubmit(values: z.infer<typeof userNameFormSchema>) {
    setUserName(values.name);
    toast({
      title: t.userNameUpdatedToast,
      description: t.userNameUpdatedToastDesc.replace('{name}', values.name),
    });
  }

  function onUserGenderSubmit(values: z.infer<typeof userGenderFormSchema>) {
    setUserGender(values.gender);
    toast({
      title: t.userGenderUpdatedToast,
      description: t.userGenderUpdatedToastDesc,
    });
  }

  function onUserRoleSubmit(values: z.infer<typeof userRoleFormSchema>) {
    setUserRole(values.role);
    toast({
      title: t.userRoleUpdatedToast,
      description: t.userRoleUpdatedToastDesc,
    });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast({
          title: t.uploadSuccessToast,
          description: t.uploadSuccessToastDesc,
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: t.uploadErrorToast,
        description: t.uploadErrorToastDesc,
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentAvatarUrl;
    link.download = "avatar.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Tabs defaultValue="character" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="character">{t.characterSettingsTitle}</TabsTrigger>
        <TabsTrigger value="user">{t.userSettingsTitle}</TabsTrigger>
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
                <AvatarImage src={currentAvatarUrl} alt="Current Avatar" data-ai-hint="woman portrait" />
                <AvatarFallback>{characterInitials}</AvatarFallback>
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
                <FormField
                  control={avatarForm.control}
                  name="negativePrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.negativePromptLabel}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t.negativePromptPlaceholder}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {t.negativePromptHint}
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

          {/* Upload and Download Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.uploadAvatarTitle}</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.uploadAvatarButton}
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadAvatarButton}
                </Button>
            </div>
          </div>


          {/* Character Name Section */}
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
       <TabsContent value="user">
        <div className="space-y-4 pt-4">
          {/* User Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.userNameTitle}</h3>
            <Form {...userNameForm}>
              <form onSubmit={userNameForm.handleSubmit(onUserNameSubmit)} className="space-y-4">
                <FormField
                  control={userNameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.userNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.userNamePlaceholder} {...field} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">{t.userNameHint}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t.saveUserNameButton}</Button>
              </form>
            </Form>
          </div>

          {/* User Gender Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.userGenderTitle}</h3>
            <Form {...userGenderForm}>
              <form onSubmit={userGenderForm.handleSubmit(onUserGenderSubmit)} className="space-y-4">
                <FormField
                  control={userGenderForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t.userGenderLabel}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="male" id="gender-male" />
                            <Label htmlFor="gender-male" className="font-normal">{t.male}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="female" id="gender-female" />
                            <Label htmlFor="gender-female" className="font-normal">{t.female}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="not_specified" id="gender-not_specified" />
                            <Label htmlFor="gender-not_specified" className="font-normal">{t.notSpecified}</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <p className="text-sm text-muted-foreground">{t.userGenderHint}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t.saveUserGenderButton}</Button>
              </form>
            </Form>
          </div>

          {/* User Role Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.userRoleTitle}</h3>
            <Form {...userRoleForm}>
              <form onSubmit={userRoleForm.handleSubmit(onUserRoleSubmit)} className="space-y-4">
                <FormField
                  control={userRoleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.userRoleLabel}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.userRolePlaceholder} {...field} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">{t.userRoleHint}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t.saveUserRoleButton}</Button>
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
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="en" id="lang-en" />
                            <Label htmlFor="lang-en" className="font-normal">{t.english}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="id" id="lang-id" />
                            <Label htmlFor="lang-id" className="font-normal">{t.indonesian}</Label>
                          </div>
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
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="default" id="theme-default" />
                            <Label htmlFor="theme-default" className="font-normal">{t.themeDefault}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="sunset" id="theme-sunset" />
                            <Label htmlFor="theme-sunset" className="font-normal">{t.themeSunset}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="ocean" id="theme-ocean" />
                            <Label htmlFor="theme-ocean" className="font-normal">{t.themeOcean}</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="forest" id="theme-forest" />
                            <Label htmlFor="theme-forest" className="font-normal">{t.themeForest}</Label>
                          </div>
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
