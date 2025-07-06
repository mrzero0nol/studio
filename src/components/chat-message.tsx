"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import type { Message } from "@/app/page";

interface ChatMessageProps {
  message: Message;
  avatarUrl: string;
}

export function ChatMessage({ message, avatarUrl }: ChatMessageProps) {
  const isBot = message.role === "assistant";
  return (
    <div
      className={`flex items-end gap-3 ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {isBot && (
        <Avatar className="h-10 w-10 shadow-sm flex-shrink-0">
          <AvatarImage src={avatarUrl} alt="PersonaForge Avatar" />
          <AvatarFallback className="bg-primary/20 text-primary">
            PF
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl p-4 shadow-md ${
          isBot
            ? "bg-card text-card-foreground rounded-bl-none"
            : "bg-primary text-primary-foreground rounded-br-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      {!isBot && (
        <Avatar className="h-10 w-10 shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-accent/80 text-accent-foreground">
                <User className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
