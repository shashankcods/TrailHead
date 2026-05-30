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
  name?: string;
  category?: string;
  sourceType?: string;
  type?: string;
  rating?: number;
  cost?: number | string;
  estimatedCost?: number | string;
  duration?: string;
  durationText?: string;
  durationMinutes?: number;
  address?: string;
  vicinity?: string;
  tags?: string[];
  openNow?: boolean;
  open_now?: boolean;
  description?: string;
  summary?: string;
  shortDescription?: string;
  crowdInfo?: string;
  crowdLevel?: string;
  bestTimeInfo?: string;
  bestTimeToVisit?: string;
  imageUrl?: string;
  photoUrl?: string;
  photoReference?: string;
  image?: string;
  photo?: string;
  photos?: unknown[];
  thumbnail?: {
    original_image?: string;
    thumbnail?: string;
  };
  images?: {
    original_image?: string;
    thumbnail?: string;
  }[];
  googleMapsUrl?: string;
  website?: string;
  websiteUrl?: string;
  url?: string;
  link?: string;
  ticketUrl?: string;
  phone?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  phoneNumber?: string;
  lat?: number;
  lon?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat?: number;
    lon?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
  };
  location?: {
    address?: string;
    lat?: number;
    lon?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
  };
  scheduledTime?: {
    start?: string;
    end?: string;
  };
  startTime?: string;
  endTime?: string;
  time?: string;
  links?: {
    website?: string;
    maps?: string;
  };
  sourceId?: string;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface PlannerItineraryDay {
  day?: number;
  dayNumber?: number;
  title?: string;
  name?: string;
  theme?: string;
  subtitle?: string;
  tagline?: string;
  summary?: string;
  description?: string;
  date?: string;
  activities?: PlannerActivity[];
}

export interface PlannerItinerary {
  days?: PlannerItineraryDay[];
}

export interface FlightOption {
  airline?: string;
  carrier?: string;
  airlineName?: string;
  flightNumber?: string;
  price?: number | string;
  totalPrice?: number | string;
  amount?: number | string;
  currency?: string;
  duration?: string;
  totalDuration?: string;
  departureTime?: string;
  departure_time?: string;
  arrivalTime?: string;
  arrival_time?: string;
  departureAirport?: string;
  from?: string;
  origin?: string;
  arrivalAirport?: string;
  to?: string;
  destination?: string;
  stops?: number | string;
  stopCount?: number;
  bookingLink?: string;
  link?: string;
  url?: string;
  segments?: unknown[];
  legs?: unknown[];
}

export interface PlannerFlightsBudgetRange {
  min?: number;
  max?: number;
}

export interface PlannerFlights {
  flights?: FlightOption[];
  route?: string;
  totalResults?: number;
  departureAirport?: string;
  arrivalAirport?: string;
  outboundDate?: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
  requestedResults?: number;
  bookingLink?: string;
  budgetRange?: PlannerFlightsBudgetRange;
}

export interface PlannerData {
  trip?: PlannerTrip;
  interests?: string[];
  budgets?: PlannerBudgets;
  itinerary?: PlannerItinerary | PlannerItineraryDay[];
  activities?: PlannerActivity[];
  flights?: PlannerFlights | null;
  hotels?: {
    hotels?: Record<string, unknown>[];
    destination?: string;
    total_results?: number;
  } | null;
  restaurants?:
    | {
        restaurants?: Record<string, unknown>[];
        destination?: string;
        totalResults?: number;
      }
    | Record<string, unknown>[]
    | null;
  events?:
    | {
        events?: Record<string, unknown>[];
        destination?: string;
        totalResults?: number;
      }
    | Record<string, unknown>[]
    | null;
  attractions?: Record<
    string,
    {
      attractions?: Record<string, unknown>[];
      destination?: string;
      activityType?: string;
    }
  >;
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
