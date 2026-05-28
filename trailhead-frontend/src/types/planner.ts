export interface PlannerTrip {
  source?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  trip_days?: number;
  adults?: number;
}

export interface PlannerBudgets {
  total?: number;
  allocations?: {
    travel?: number;
    accommodation?: number;
    food?: number;
    activities?: number;
  };
}

export interface PlannerActivity {
  activityId?: string;
  id?: string;
  title?: string;
  category?: string;
  rating?: number;
  cost?: number | string;
  scheduledTime?: {
    start?: string;
    end?: string;
  };
}

export interface PlannerItineraryDay {
  day?: number;
  theme?: string;
  date?: string;
  activities?: PlannerActivity[];
}

export interface PlannerItinerary {
  days?: PlannerItineraryDay[];
}

export interface PlannerData {
  trip?: PlannerTrip;
  interests?: string[];
  budgets?: PlannerBudgets;
  itinerary?: PlannerItinerary;
  activities?: PlannerActivity[];
  flights?: {
    flights?: Record<string, unknown>[];
    route?: string;
    totalResults?: number;
  } | null;
  hotels?: {
    hotels?: Record<string, unknown>[];
    destination?: string;
    total_results?: number;
  } | null;
  restaurants?: Record<string, unknown>[] | null;
  events?: Record<string, unknown>[] | null;
  safety?: Record<string, unknown> | null;
  weather?: {
    destination?: string;
    country?: string;
    forecast?: {
      date: string;
      maxTemp: number;
      minTemp: number;
      rainAmount: number;
      condition: string;
    }[];
  } | null;
}
