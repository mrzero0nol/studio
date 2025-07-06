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
import { Menu, Send, Loader2 } from "lucide-react";
import { SettingsForm } from "@/components/settings-form";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help you today? You can customize my avatar and personality in the settings menu in the top right.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128/9400D3/FFFFFF.png?text=PF");
  const [interactionStyle, setInteractionStyle] = useState("a creative and imaginative assistant");
  const [sheetOpen, setSheetOpen] = useState(false);

  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

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
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background font-body">
      <header className="flex items-center justify-between p-3 border-b shadow-sm bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/50">
            <AvatarImage src={avatarUrl} alt="PersonaForge Avatar" data-ai-hint="robot avatar" />
            <AvatarFallback>PF</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold font-headline text-primary">PersonaForge</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </p>
          </div>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-md sm:max-w-lg bg-background/95 backdrop-blur-sm">
            <SheetHeader>
              <SheetTitle className="font-headline text-2xl text-primary">Settings</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <SettingsForm
              setAvatarUrl={setAvatarUrl}
              setInteractionStyle={setInteractionStyle}
              currentStyle={interactionStyle}
              closeSheet={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
          <div className="p-4 space-y-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} avatarUrl={avatarUrl} />
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                 <Avatar className="h-10 w-10 shadow-sm flex-shrink-0">
                    <AvatarImage src={avatarUrl} alt="PersonaForge Avatar" />
                    <AvatarFallback className='bg-primary/20 text-primary'>PF</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 p-4 rounded-2xl rounded-bl-none bg-card shadow-md">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground italic text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 border-t bg-card/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 text-base py-6 rounded-full"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="rounded-full w-12 h-12" aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
