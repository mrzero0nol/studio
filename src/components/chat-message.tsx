"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/app/page";

interface ChatMessageProps {
  message: Message;
  avatarUrl: string;
  characterInitials: string;
}

function parseContent(content: string, isAssistant: boolean) {
  const parts = content.split(/(\*.*?\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em
              key={index}
              className={`italic ${
                isAssistant ? "text-muted-foreground" : "text-black/80"
              }`}
            >
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </>
  );
}

export function ChatMessage({ message, avatarUrl, characterInitials }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  return (
    <div
      className={`flex items-end gap-3 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {isAssistant && (
        <Avatar className="h-10 w-10 shadow-sm flex-shrink-0">
          <AvatarImage src={avatarUrl} alt="Custom Chat Character Avatar" />
          <AvatarFallback className="bg-primary/20 text-primary">
            {characterInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl p-4 shadow-md ${
          isAssistant
            ? "bg-card text-card-foreground rounded-bl-none"
            : "bg-primary text-primary-foreground rounded-br-none"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {parseContent(message.content, isAssistant)}
        </p>
      </div>
    </div>
  );
}
