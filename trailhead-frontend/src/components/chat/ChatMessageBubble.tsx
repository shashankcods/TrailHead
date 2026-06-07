import React from "react";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isError = message.status === "error";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-black text-white dark:bg-white dark:text-black"
            : isError
              ? "border border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-300"
              : "border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/40 text-black/85 dark:text-white/85 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
