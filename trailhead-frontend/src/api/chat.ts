import type { PlannerData, PlannerItinerary, PlannerItineraryDay } from "@/types/planner";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export interface ModifyItineraryRequest {
  itinerary: PlannerData["itinerary"];
  userMessage: string;
  activities: PlannerData["activities"];
  budget: PlannerData["budgets"];
  trip: PlannerData["trip"];
}

export interface ModifyItineraryResponse {
  itinerary: PlannerItinerary | PlannerItineraryDay[];
  intent: Record<string, unknown>;
  serverMessage?: string;
}

const INTENT_REPLIES: Record<string, string> = {
  add_nightlife: "Done! I've added nightlife options to your itinerary.",
  relax_day: "Done! I've made the schedule more relaxed.",
  replace_activity: "Done! I've swapped out the activity.",
  reduce_budget: "Done! I've adjusted the itinerary to reduce costs.",
  add_food: "Done! I've added food options to your itinerary.",
  remove_activity: "Done! I've removed that activity.",
};

export function replyFromIntent(intent: Record<string, unknown>): string {
  const action = intent?.action as string | undefined;
  return (action && INTENT_REPLIES[action]) ?? "Done! I've updated your itinerary.";
}

export async function modifyItinerary(
  payload: ModifyItineraryRequest
): Promise<ModifyItineraryResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/modify-itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError")
      throw new Error("Request timed out. The assistant took too long to respond.");
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (result as { message?: string })?.message ||
        `Failed to modify itinerary (${res.status})`
    );
  }

  const data = result as {
    success?: boolean;
    itinerary?: PlannerItinerary | PlannerItineraryDay[];
    intent?: Record<string, unknown>;
    message?: string;
  };

  if (!data.success || !data.itinerary) {
    throw new Error("Invalid response from itinerary modifier");
  }

  return { itinerary: data.itinerary, intent: data.intent ?? {}, serverMessage: data.message };
}
