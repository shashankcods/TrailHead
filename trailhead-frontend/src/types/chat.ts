import type { PlannerActivity, PlannerData } from "@/types/planner";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  action?: ItineraryAction;
  status?: "sending" | "sent" | "error";
}

export type ItineraryAction =
  | { type: "ANSWER_ONLY" }
  | {
      type: "REMOVE_ACTIVITY";
      payload: {
        dayNumber?: number;
        activityId?: string;
        activityTitle?: string;
      };
    }
  | {
      type: "ADD_ACTIVITY";
      payload: {
        dayNumber: number;
        activity: PlannerActivity;
      };
    }
  | {
      type: "MOVE_ACTIVITY";
      payload: {
        fromDayNumber?: number;
        toDayNumber: number;
        activityId?: string;
        activityTitle?: string;
        timeLabel?: string;
      };
    }
  | {
      type: "UPDATE_ACTIVITY";
      payload: {
        dayNumber?: number;
        activityId?: string;
        activityTitle?: string;
        updates: Partial<PlannerActivity>;
      };
    };

export interface ChatRequest {
  message: string;
  plannerData: PlannerData;
  chatHistory: Pick<ChatMessage, "role" | "content">[];
}

export interface ChatResponse {
  reply: string;
  action?: ItineraryAction;
}
