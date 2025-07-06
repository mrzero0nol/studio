"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/app/page";

interface ChatMessageProps {
  message: Message;
  avatarUrl: string;
  botInitials: string;
}

function parseContent(content: string) {
  const parts = content.split(/(\*.*?\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={index} className="italic text-muted-foreground">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </>
  );
}

export function ChatMessage({ message, avatarUrl, botInitials }: ChatMessageProps) {
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
            {botInitials}
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {parseContent(message.content)}
        </p>
      </div>
    </div>
  );
}
