import React, { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, RotateCcw } from "lucide-react";
import type { PlannerData, PlannerItinerary, PlannerItineraryDay } from "@/types/planner";
import type { ChatMessage } from "@/types/chat";
import { modifyItinerary, replyFromIntent } from "@/api/chat";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatPromptChips from "@/components/chat/ChatPromptChips";

const WELCOME_ID = "welcome-assistant";

const createMessageId = () =>
  `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const welcomeMessage = (): ChatMessage => ({
  id: WELCOME_ID,
  role: "assistant",
  content:
    "Hi, I can help you understand or edit this itinerary. Ask me to summarize the trip, make it cheaper, move activities, or remove places.",
  createdAt: new Date().toISOString(),
  status: "sent",
});

interface TripChatDrawerProps {
  open: boolean;
  onClose: () => void;
  plannerData: PlannerData | null;
  onItineraryReplaced: (itinerary: PlannerItinerary | PlannerItineraryDay[]) => void;
  canUndo?: boolean;
  onUndo?: () => void;
}

const TripChatDrawer: React.FC<TripChatDrawerProps> = ({
  open,
  onClose,
  plannerData,
  onItineraryReplaced,
  canUndo,
  onUndo,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || loading || !plannerData) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    const historyForApi = messages
      .filter((m) => m.id !== WELCOME_ID && m.status !== "error")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await modifyItinerary({
        itinerary: plannerData.itinerary,
        userMessage: text,
        activities: plannerData.activities,
        budget: plannerData.budgets,
        trip: plannerData.trip,
      });

      onItineraryReplaced(response.itinerary);

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.serverMessage ?? replyFromIntent(response.intent),
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: message,
          createdAt: new Date().toISOString(),
          status: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  if (!open) return null;

  const contextConnected = Boolean(plannerData);

  return (
    <>
      <button
        type="button"
        aria-label="Close chat"
        className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/60 md:bg-black/25"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-black/10 bg-white shadow-2xl dark:border-white/15 dark:bg-black md:w-[min(100%,440px)]"
        role="dialog"
        aria-labelledby="trip-chat-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/10 px-4 py-4 dark:border-white/15">
          <div className="min-w-0">
            <h2 id="trip-chat-title" className="text-lg font-extrabold tracking-tight">
              Trip Assistant
            </h2>
            <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
              Ask questions or edit this itinerary.
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                contextConnected
                  ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/30 text-amber-700 dark:text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  contextConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {contextConnected ? "Trip context connected" : "Trip context unavailable"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {canUndo && onUndo && (
              <button
                type="button"
                onClick={onUndo}
                title="Undo last itinerary change"
                className="rounded-lg border border-black/15 p-2 dark:border-white/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg border border-black/15 p-2 dark:border-white/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <ChatPromptChips
              onSelect={(prompt) => void sendMessage(prompt)}
              disabled={loading || !plannerData}
            />

            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3.5 py-2.5 text-sm text-black/60 dark:text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}

            {error && !loading && (
              <p className="text-xs text-red-600 dark:text-red-400 px-1">{error}</p>
            )}

            <div ref={listEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-black/10 dark:border-white/15 p-4 space-y-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading || !plannerData}
              placeholder={
                plannerData
                  ? "Ask about your trip or request an edit…"
                  : "Trip data unavailable"
              }
              className="w-full resize-none rounded-xl border border-black/15 dark:border-white/20 bg-white dark:bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !input.trim() || !plannerData}
                className="inline-flex items-center gap-2 rounded-xl border border-black dark:border-white bg-black px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
};

export default TripChatDrawer;
