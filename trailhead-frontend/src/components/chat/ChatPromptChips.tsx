import React from "react";

const PROMPTS = [
  "Summarize this trip",
  "Make this itinerary cheaper",
  "Make this trip more relaxed",
  "What if it rains?",
  "Suggest food options",
] as const;

interface ChatPromptChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const ChatPromptChips: React.FC<ChatPromptChipsProps> = ({
  onSelect,
  disabled,
}) => (
  <div className="flex flex-wrap gap-2">
    {PROMPTS.map((prompt) => (
      <button
        key={prompt}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(prompt)}
        className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs font-semibold text-black/75 dark:text-white/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {prompt}
      </button>
    ))}
  </div>
);

export default ChatPromptChips;
