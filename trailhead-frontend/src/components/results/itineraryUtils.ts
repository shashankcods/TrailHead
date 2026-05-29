import type { PlannerData } from "@/types/planner";

type UnknownRecord = Record<string, unknown>;

export interface NormalizedActivity {
  id: string;
  title: string;
  category?: string;
  sourceType?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  timeLabel?: string;
  duration?: string;
  rating?: number;
  estimatedCost?: string;
  address?: string;
  tags: string[];
  openNow?: boolean;
  description?: string;
  crowdInfo?: string;
  bestTimeInfo?: string;
  imageUrl?: string;
  website?: string;
  phone?: string;
  directionsUrl?: string;
}

export interface NormalizedDay {
  id: string;
  dayNumber: number;
  date?: string;
  title: string;
  subtitle?: string;
  summary?: string;
  activities: NormalizedActivity[];
}

const asRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number") return String(value);
  return undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter((item): item is string => Boolean(item));
};

const extractPlaceIdFromMapsUrl = (mapsUrl?: string) => {
  if (!mapsUrl) return undefined;
  const match = mapsUrl.match(/place_id:([^&]+)/i);
  return match?.[1];
};

const isRenderableImageUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("/api/") ||
  value.startsWith("/");

export const resolveMediaUrl = (url?: string): string | undefined => {
  if (!url || !isRenderableImageUrl(url)) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}${url}` : url;
};

export const getActivityImage = (activity: UnknownRecord): string | undefined => {
  const direct =
    asString(activity.imageUrl) ??
    asString(activity.photoUrl) ??
    asString(activity.image);

  if (direct && isRenderableImageUrl(direct)) {
    return resolveMediaUrl(direct);
  }

  const thumbnail = asRecord(activity.thumbnail);
  const fromThumbnail =
    asString(thumbnail?.original_image) ?? asString(thumbnail?.thumbnail);
  if (fromThumbnail) return resolveMediaUrl(fromThumbnail);

  if (Array.isArray(activity.images)) {
    const firstImage = asRecord(activity.images[0]);
    const fromImages =
      asString(firstImage?.original_image) ?? asString(firstImage?.thumbnail);
    if (fromImages) return resolveMediaUrl(fromImages);
  }

  if (Array.isArray(activity.photos)) {
    const firstPhoto = activity.photos[0];
    if (typeof firstPhoto === "string" && isRenderableImageUrl(firstPhoto)) {
      return resolveMediaUrl(firstPhoto);
    }
    const photoRecord = asRecord(firstPhoto);
    const fromPhoto =
      asString(photoRecord?.url) ?? asString(photoRecord?.photoUrl);
    if (fromPhoto && isRenderableImageUrl(fromPhoto)) {
      return resolveMediaUrl(fromPhoto);
    }
  }

  return undefined;
};

export const getActivityWebsite = (activity: UnknownRecord): string | undefined => {
  const links = asRecord(activity.links);
  return (
    asString(activity.website) ??
    asString(activity.websiteUrl) ??
    asString(activity.url) ??
    asString(activity.link) ??
    asString(activity.ticketUrl) ??
    asString(links?.website)
  );
};

export const getActivityPhone = (activity: UnknownRecord): string | undefined =>
  asString(activity.phone) ??
  asString(activity.phoneNumber) ??
  asString(activity.formattedPhoneNumber) ??
  asString(activity.internationalPhoneNumber);

const getActivityLatLon = (
  activity: UnknownRecord
): { lat: number; lon: number } | undefined => {
  const coordinates = asRecord(activity.coordinates);
  const location = asRecord(activity.location);
  const gps = asRecord(activity.gps_coordinates);

  const lat =
    asNumber(coordinates?.lat) ??
    asNumber(coordinates?.latitude) ??
    asNumber(location?.latitude) ??
    asNumber(location?.lat) ??
    asNumber(gps?.latitude) ??
    asNumber(activity.lat) ??
    asNumber(activity.latitude);

  const lon =
    asNumber(coordinates?.lon) ??
    asNumber(coordinates?.lng) ??
    asNumber(coordinates?.longitude) ??
    asNumber(location?.longitude) ??
    asNumber(location?.lng) ??
    asNumber(location?.lon) ??
    asNumber(gps?.longitude) ??
    asNumber(gps?.lng) ??
    asNumber(activity.lon) ??
    asNumber(activity.lng) ??
    asNumber(activity.longitude);

  if (lat != null && lon != null) return { lat, lon };
  return undefined;
};

export const getDirectionsUrl = (activity: UnknownRecord): string | undefined => {
  const links = asRecord(activity.links);
  const googleMaps =
    asString(activity.googleMapsUrl) ?? asString(links?.maps);
  if (googleMaps) return googleMaps;

  const latLon = getActivityLatLon(activity);
  if (latLon) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latLon.lat},${latLon.lon}`;
  }

  const address =
    asString(activity.address) ??
    asString(activity.vicinity) ??
    asString(asRecord(activity.location)?.address);
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  const title =
    asString(activity.title) ?? asString(activity.name);
  if (title) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}`;
  }

  return undefined;
};

export const buildActivityCatalogLookup = (
  plannerData: PlannerData
): Map<string, UnknownRecord> => {
  const lookup = new Map<string, UnknownRecord>();

  const register = (key: string | undefined, record: UnknownRecord) => {
    if (!key) return;
    const existing = lookup.get(key);
    lookup.set(key, existing ? { ...existing, ...record } : { ...record });
  };

  for (const activity of plannerData.activities ?? []) {
    const record = asRecord(activity);
    if (!record) continue;
    register(asString(record.id), record);
    register(asString(record.activityId), record);
    register(asString(record.sourceId), record);
  }

  const restaurantsRoot = asRecord(plannerData.restaurants);
  const restaurants = Array.isArray(plannerData.restaurants)
    ? plannerData.restaurants
    : Array.isArray(restaurantsRoot?.restaurants)
    ? (restaurantsRoot.restaurants as unknown[])
    : [];

  for (const item of restaurants) {
    const record = asRecord(item);
    if (!record) continue;
    register(asString(record.placeId), record);
    register(extractPlaceIdFromMapsUrl(asString(record.googleMapsUrl)), record);
  }

  const attractions = plannerData.attractions;
  if (attractions && typeof attractions === "object") {
    for (const interestData of Object.values(attractions)) {
      const data = asRecord(interestData);
      const list = Array.isArray(data?.attractions) ? data.attractions : [];
      for (const attraction of list) {
        const record = asRecord(attraction);
        if (!record) continue;
        register(extractPlaceIdFromMapsUrl(asString(record.googleMapsUrl)), record);
        register(asString(record.name), record);
      }
    }
  }

  const eventsRoot = asRecord(plannerData.events);
  const events = Array.isArray(plannerData.events)
    ? plannerData.events
    : Array.isArray(eventsRoot?.events)
    ? (eventsRoot.events as unknown[])
    : [];

  for (const item of events) {
    const record = asRecord(item);
    if (!record) continue;
    register(asString(record.id), record);
    register(asString(record.title), record);
  }

  const hotelsRoot = asRecord(plannerData.hotels);
  const hotels = Array.isArray(hotelsRoot?.hotels)
    ? (hotelsRoot.hotels as unknown[])
    : [];

  for (const item of hotels) {
    const record = asRecord(item);
    if (!record) continue;
    register(asString(record.id), record);
    register(asString(record.name), record);
  }

  return lookup;
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const buildDateFromStart = (startDate: string | undefined, dayNumber: number) => {
  if (!startDate) return undefined;
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + Math.max(0, dayNumber - 1));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getScheduledRange = (activity: UnknownRecord): {
  start?: string;
  end?: string;
} => {
  const scheduledTime = asRecord(activity.scheduledTime);
  const start =
    asString(scheduledTime?.start) ??
    asString(activity.startTime) ??
    asString(activity.time);
  const end = asString(scheduledTime?.end) ?? asString(activity.endTime);
  return { start, end };
};

const formatTimeLabel = (start?: string, end?: string) => {
  if (start && end) return `${start} - ${end}`;
  return start ?? end;
};

const getPartOfDay = (start?: string) => {
  if (!start) return "anytime";
  const hourMatch = start.match(/(\d{1,2})/);
  if (!hourMatch) return "anytime";
  const rawHour = Number(hourMatch[1]);
  if (!Number.isFinite(rawHour)) return "anytime";
  const lower = start.toLowerCase();
  const hour =
    lower.includes("pm") && rawHour < 12
      ? rawHour + 12
      : lower.includes("am") && rawHour === 12
      ? 0
      : rawHour;
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const mergeActivityRecords = (
  lookup: Map<string, UnknownRecord>,
  itineraryActivity: UnknownRecord
): UnknownRecord => {
  const refId =
    asString(itineraryActivity.activityId) ?? asString(itineraryActivity.id);

  const fromCatalog: UnknownRecord = (refId ? lookup.get(refId) : undefined) ?? {};
  const sourceId = asString(fromCatalog.sourceId) ?? asString(itineraryActivity.sourceId);
  const fromSourceId = (sourceId && lookup.get(sourceId)) ?? {};

  return { ...fromSourceId, ...fromCatalog, ...itineraryActivity };
};

export const normalizePlannerItinerary = (plannerData: PlannerData): NormalizedDay[] => {
  const activitiesLookup = buildActivityCatalogLookup(plannerData);

  const itineraryRecord = asRecord(plannerData.itinerary);
  const rawDays = Array.isArray(plannerData.itinerary)
    ? plannerData.itinerary
    : Array.isArray(itineraryRecord?.days)
    ? itineraryRecord.days
    : [];

  return rawDays.map((rawDay, index) => {
    const dayRecord = asRecord(rawDay) ?? {};
    const dayNumber = asNumber(dayRecord.day) ?? asNumber(dayRecord.dayNumber) ?? index + 1;
    const dayActivitiesRaw = Array.isArray(dayRecord.activities) ? dayRecord.activities : [];

    const activities = dayActivitiesRaw.map((rawActivity, activityIndex) => {
      const itineraryActivity = asRecord(rawActivity) ?? {};
      const merged = mergeActivityRecords(activitiesLookup, itineraryActivity);
      const { start, end } = getScheduledRange(merged);

      const tags = [
        ...asStringArray(merged.tags),
        ...asStringArray(merged.keywords),
        ...asStringArray(merged.types),
      ].filter((tag, idx, all) => all.indexOf(tag) === idx);

      const costRecord = asRecord(merged.estimatedCost);

      return {
        id: asString(merged.id) ?? asString(merged.activityId) ?? `${dayNumber}-${activityIndex}`,
        title: asString(merged.title) ?? asString(merged.name) ?? "Untitled activity",
        category: asString(merged.category),
        sourceType: asString(merged.sourceType) ?? asString(merged.type),
        scheduledStart: start,
        scheduledEnd: end,
        timeLabel: formatTimeLabel(start, end),
        duration:
          asString(merged.duration) ??
          asString(merged.durationText) ??
          (asNumber(merged.durationMinutes)
            ? `${asNumber(merged.durationMinutes)} mins`
            : undefined),
        rating: asNumber(merged.rating) ?? asNumber(merged.overall_rating),
        estimatedCost:
          asString(merged.estimatedCost) ??
          asString(costRecord?.max) ??
          asString(merged.cost) ??
          asString(merged.price) ??
          (merged.price_per_night != null
            ? String(merged.price_per_night)
            : undefined),
        address:
          asString(merged.address) ??
          asString(merged.vicinity) ??
          asString(asRecord(merged.location)?.address),
        tags,
        openNow:
          asBoolean(merged.openNow) ??
          asBoolean(merged.open_now) ??
          asBoolean(asRecord(merged.metadata)?.openNow),
        description:
          asString(merged.description) ??
          asString(merged.summary) ??
          asString(merged.shortDescription),
        crowdInfo: asString(merged.crowdInfo) ?? asString(merged.crowdLevel),
        bestTimeInfo:
          asString(merged.bestTimeInfo) ??
          asString(merged.bestTimeToVisit) ??
          asString(merged.recommendedVisitTime),
        imageUrl: getActivityImage(merged),
        website: getActivityWebsite(merged),
        phone: getActivityPhone(merged),
        directionsUrl: getDirectionsUrl(merged),
        partOfDay: getPartOfDay(start),
      } as NormalizedActivity & { partOfDay: string };
    });

    const sortedActivities = activities.sort((a, b) => {
      const order = { morning: 1, afternoon: 2, evening: 3, anytime: 4 };
      return order[a.partOfDay as keyof typeof order] - order[b.partOfDay as keyof typeof order];
    });

    return {
      id: `day-${dayNumber}`,
      dayNumber,
      date:
        formatDate(asString(dayRecord.date)) ??
        buildDateFromStart(plannerData.trip?.start_date, dayNumber),
      title:
        asString(dayRecord.title) ??
        asString(dayRecord.theme) ??
        asString(dayRecord.name) ??
        `Day ${dayNumber}`,
      subtitle: asString(dayRecord.subtitle) ?? asString(dayRecord.tagline),
      summary: asString(dayRecord.summary) ?? asString(dayRecord.description),
      activities: sortedActivities,
    };
  });
};

export const countItineraryActivities = (days: NormalizedDay[]) =>
  days.reduce((total, day) => total + day.activities.length, 0);
