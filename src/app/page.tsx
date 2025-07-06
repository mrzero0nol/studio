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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Send, Loader2, Trash2 } from "lucide-react";
import { SettingsForm } from "@/components/settings-form";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

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
  },
  id: {
    online: 'Daring',
    openSettings: 'Buka Pengaturan',
    settingsTitle: 'Pengaturan',
    thinking: 'Sedang mengetik...',
    placeholder: 'Tanyakan apa saja...',
    sendMessage: 'Kirim pesan',
    errorMessage: "Maaf, terjadi kesalahan. Silakan coba lagi.",
    clearChat: "Bersihkan Obrolan",
  },
};

export default function Home() {
  // Initialize state with default values for SSR and initial client render
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128/9400D3/FFFFFF.png?text=PF");
  const [interactionStyle, setInteractionStyle] = useState("a friendly and empathetic companion who communicates in a natural, conversational manner, like a real person. Use casual language and avoid sounding robotic.");
  const [botName, setBotName] = useState("PersonaForge");
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage);
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
          <Avatar className="w-12 h-12 border-2 border-primary/50">
            <AvatarImage src={avatarUrl} alt="PersonaForge Avatar" data-ai-hint="robot avatar" />
            <AvatarFallback>{botInitials}</AvatarFallback>
          </Avatar>
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
          <SheetContent className="w-full max-w-md sm:max-w-lg bg-background/95 backdrop-blur-sm">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl text-primary">{t.settingsTitle}</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <SettingsForm
              setAvatarUrl={setAvatarUrl}
              setInteractionStyle={setInteractionStyle}
              currentStyle={interactionStyle}
              closeSheet={() => setSheetOpen(false)}
              setBotName={setBotName}
              currentBotName={botName}
              setLanguage={setLanguage}
              currentLanguage={language}
            />
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
                    <AvatarImage src={avatarUrl} alt="PersonaForge Avatar" />
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
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearChat}
            className="rounded-full w-12 h-12"
            aria-label={t.clearChat}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
