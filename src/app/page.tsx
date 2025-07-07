"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { getResponse } from "@/app/actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Send, Loader2, X } from "lucide-react";
import { SettingsForm } from "@/components/settings-form";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Theme = "default" | "sunset" | "ocean" | "forest";

const translations = {
  en: {
    online: 'Online',
    openSettings: 'Open Settings',
    settingsTitle: 'Settings',
    thinking: 'Typing...',
    placeholder: 'Ask me anything...',
    sendMessage: 'Send message',
    errorMessage: "Sorry, I encountered an error. Please try again.",
    clearChat: "Clear Chat",
    dialogCancel: "Cancel",
    avatarPreviewTitle: "Avatar Preview",
  },
  id: {
    online: 'Online',
    openSettings: 'Buka Pengaturan',
    settingsTitle: 'Pengaturan',
    thinking: 'Sedang mengetik...',
    placeholder: 'Tanyakan apa saja...',
    sendMessage: 'Kirim pesan',
    errorMessage: "Maaf, terjadi kesalahan. Silakan coba lagi.",
    clearChat: "Bersihkan Obrolan",
    dialogCancel: "Batal",
    avatarPreviewTitle: "Pratinjau Avatar",
  },
};

export default function Home() {
  // Initialize state with default values for SSR and initial client render
  const [theme, setTheme] = useState<Theme>('default');
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128/9400D3/FFFFFF.png?text=CC");
  const [interactionStyle, setInteractionStyle] = useState("a friendly and empathetic companion who communicates in a natural, conversational manner, like a real person. Use casual language, be expressive with emojis, and avoid sounding robotic.");
  const [botName, setBotName] = useState("Custom Chat Character");
  const [messages, setMessages] = useState<Message[]>([]);
  const [storyMode, setStoryMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ['default', 'sunset', 'ocean', 'forest'].includes(savedTheme)) {
      setTheme(savedTheme as Theme);
    }

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage as 'en' | 'id');
    }

    const savedBotName = localStorage.getItem("botName");
    if (savedBotName) {
      setBotName(savedBotName);
    }

    const savedAvatarUrl = localStorage.getItem("avatarUrl");
    if (savedAvatarUrl) {
      setAvatarUrl(savedAvatarUrl);
    }

    const savedInteractionStyle = localStorage.getItem("interactionStyle");
    if (savedInteractionStyle) {
      setInteractionStyle(savedInteractionStyle);
    }
    
    const savedStoryMode = localStorage.getItem("storyMode");
    if (savedStoryMode) {
      setStoryMode(JSON.parse(savedStoryMode));
    }

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      } catch (e) {
        console.error("Failed to parse messages from localStorage", e);
        setMessages([]);
      }
    }
  }, []);

  const t = translations[language];
  const botInitials = botName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem("botName", botName);
  }, [botName]);

  useEffect(() => {
    localStorage.setItem("avatarUrl", avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    localStorage.setItem("interactionStyle", interactionStyle);
  }, [interactionStyle]);

  useEffect(() => {
    localStorage.setItem("storyMode", JSON.stringify(storyMode));
  }, [storyMode]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const themes: Theme[] = ['sunset', 'ocean', 'forest'];
    document.documentElement.classList.remove(...themes.map(t => `theme-${t}`));

    if (theme !== 'default') {
        document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await getResponse({
        userInput: currentInput,
        characterSettings: `Your interaction style is: ${interactionStyle}.`,
        chatHistory,
        language: language,
        storyMode: storyMode,
      });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t.errorMessage,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col bg-background font-body">
      <header className="flex items-center justify-between p-3 border-b shadow-sm bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Dialog open={isAvatarPreviewOpen} onOpenChange={setIsAvatarPreviewOpen}>
            <DialogTrigger asChild>
              <Avatar className="w-12 h-12 border-2 border-primary/50 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={avatarUrl} alt="Custom Chat Character Avatar" data-ai-hint="robot avatar" />
                <AvatarFallback>{botInitials}</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-lg">
                <DialogTitle className="sr-only">{t.avatarPreviewTitle}</DialogTitle>
                <img src={avatarUrl} alt="Enlarged Avatar" className="rounded-md w-full h-auto object-contain" />
                 <DialogClose className="absolute right-2 top-2 rounded-full p-1.5 bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
          </Dialog>
          <div>
            <h1 className="text-xl font-bold font-headline text-primary">{botName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t.online}
            </p>
          </div>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{t.openSettings}</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-md sm:max-w-lg bg-background/95 backdrop-blur-sm flex flex-col">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl text-primary">{t.settingsTitle}</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <ScrollArea className="flex-1">
              <div className="pr-4">
                <SettingsForm
                  setAvatarUrl={setAvatarUrl}
                  setInteractionStyle={setInteractionStyle}
                  currentStyle={interactionStyle}
                  closeSheet={() => setSheetOpen(false)}
                  setBotName={setBotName}
                  currentBotName={botName}
                  setLanguage={setLanguage}
                  currentLanguage={language}
                  handleClearChat={handleClearChat}
                  setTheme={setTheme}
                  currentTheme={theme}
                  setStoryMode={setStoryMode}
                  currentStoryMode={storyMode}
                  setDarkMode={setDarkMode}
                  currentDarkMode={darkMode}
                />
              </div>
            </ScrollArea>
             <div className="p-4 text-center text-xs text-muted-foreground">
                <div>
                  <span className="mr-1">Custom Chat Character</span>
                  <span>V1.36.2 (beta)</span>
                </div>
                <div>
                  <span>farqonzero.dev</span>
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
          <div className="p-4 space-y-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} avatarUrl={avatarUrl} botInitials={botInitials} />
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                 <Avatar className="h-10 w-10 shadow-sm flex-shrink-0">
                    <AvatarImage src={avatarUrl} alt="Custom Chat Character Avatar" />
                    <AvatarFallback className='bg-primary/20 text-primary'>{botInitials}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 p-4 rounded-2xl rounded-bl-none bg-card shadow-md">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground italic text-sm">{t.thinking}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 border-t bg-card/50">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 text-base py-6 rounded-full"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <Button type="submit" size="icon" disabled={isLoading} className="rounded-full w-12 h-12" aria-label={t.sendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
