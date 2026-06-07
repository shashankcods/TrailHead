import type { ChatRequest, ChatResponse } from "@/types/chat";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export async function sendTripChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (result as { message?: string })?.message ||
        `Chat request failed (${res.status})`
    );
  }

  const data = (result as { data?: ChatResponse }).data;
  if (!data?.reply) {
    throw new Error("Invalid chat response from server");
  }

  return data;
}
