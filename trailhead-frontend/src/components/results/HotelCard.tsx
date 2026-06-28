import React from "react";
import {
  Wifi,
  Car,
  Coffee,
  Waves,
  Snowflake,
  Dumbbell,
  Sparkles,
  Utensils,
  GlassWater,
  Bell,
  Check,
  MapPin,
  Heart
} from "lucide-react";

type UnknownRecord = Record<string, unknown>;

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

const pickField = (hotel: UnknownRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asString(hotel[key]);
    if (value) return value;
  }
  return undefined;
};

const pickNumber = (hotel: UnknownRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const raw = hotel[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
};

const asArray = (value: unknown): UnknownRecord[] => {
  if (!Array.isArray(value)) return [];
  return value.map(asRecord).filter((item): item is UnknownRecord => Boolean(item));
};

interface HotelCardProps {
  hotel: UnknownRecord;
  index: number;
  defaultCurrency?: string;
  destination?: string;
}

const getAmenityIcon = (amenityName: string) => {
  const lower = amenityName.toLowerCase();
  if (lower.includes("wi-fi") || lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5" />;
  if (lower.includes("parking")) return <Car className="w-3.5 h-3.5" />;
  if (lower.includes("breakfast")) return <Coffee className="w-3.5 h-3.5" />;
  if (lower.includes("pool")) return <Waves className="w-3.5 h-3.5" />;
  if (lower.includes("air conditioning") || lower.includes("ac")) return <Snowflake className="w-3.5 h-3.5" />;
  if (lower.includes("fitness") || lower.includes("gym")) return <Dumbbell className="w-3.5 h-3.5" />;
  if (lower.includes("spa")) return <Sparkles className="w-3.5 h-3.5" />;
  if (lower.includes("restaurant")) return <Utensils className="w-3.5 h-3.5" />;
  if (lower.includes("bar")) return <GlassWater className="w-3.5 h-3.5" />;
  if (lower.includes("shuttle")) return <Car className="w-3.5 h-3.5" />;
  if (lower.includes("pet")) return <Heart className="w-3.5 h-3.5" />;
  if (lower.includes("room service")) return <Bell className="w-3.5 h-3.5" />;
  return <Check className="w-3.5 h-3.5" />;
};

const HotelCard: React.FC<HotelCardProps> = ({ hotel, index, defaultCurrency, destination }) => {
  const record = hotel;
  const [imgFailed, setImgFailed] = React.useState(false);

  const hotelName = pickField(record, ["name", "title"]);
  const description = pickField(record, ["description", "summary", "shortDescription"]);
  const rating = pickNumber(record, ["rating", "overall_rating"]);
  const reviews = pickNumber(record, ["reviews", "reviews_count", "reviewsCount"]);
  const pricePerNight = pickNumber(record, ["price_per_night", "pricePerNight", "price"]);
  const currency = pickField(record, ["currency"]) ?? defaultCurrency ?? "USD";
  const hotelClass = pickField(record, ["hotel_class", "hotelClass", "stars", "starRating"]);
  const type = pickField(record, ["type", "propertyType", "property_type"]);
  const checkInTime = pickField(record, ["check_in_time", "checkInTime"]);
  const checkOutTime = pickField(record, ["check_out_time", "checkOutTime"]);
  const allAmenities = asArray(record["amenities"]);
  const visibleAmenities = allAmenities.slice(0, 6);
  const nearbyPlaces = asArray(record["nearby_places"]).slice(0, 3);
  const address = pickField(record, ["address", "location", "vicinity"]);
  const bookingLink = pickField(record, ["link", "url", "booking_link", "bookingLink", "website"]);
  const gpsCoordinates = asRecord(record["gps_coordinates"]);
  
  // Get thumbnail/image
  let thumbnail: string | undefined;
  const thumbnailField = record["thumbnail"];
  const thumbnailRecord = asRecord(thumbnailField);
  if (thumbnailRecord) {
    thumbnail = asString(thumbnailRecord["thumbnail"]) ?? asString(thumbnailRecord["original_image"]);
  }
  if (!thumbnail) {
    const images = asArray(record["images"]);
    if (images.length > 0) {
      thumbnail = asString(images[0]["thumbnail"]) ?? asString(images[0]["original_image"]);
    }
  }
  if (!thumbnail) {
    thumbnail = asString(record["image"]) ?? asString(record["photo"]);
  }

  // Build Google Maps link
  const getGoogleMapsLink = () => {
    if (gpsCoordinates) {
      const lat = gpsCoordinates["latitude"];
      const lng = gpsCoordinates["longitude"];
      if (typeof lat === "number" && typeof lng === "number") {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    const query = encodeURIComponent(`${hotelName || "Hotel"} ${destination || ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };
  const mapsLink = getGoogleMapsLink();

  return (
    <article className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-black/35 shadow-sm p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4 items-start">
          <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/15 w-24 h-24 flex-shrink-0 bg-black/5 dark:bg-white/5 flex items-center justify-center text-center">
            {thumbnail && !imgFailed ? (
              <img
                src={thumbnail}
                alt={hotelName ?? "Hotel"}
                className="w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="text-2xl opacity-30">🏨</span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
              Hotel {index + 1}
            </p>
            <h4 className="text-lg font-bold mt-0.5">
              {hotelName ?? "Hotel name not provided"}
            </h4>
            <div className="flex flex-wrap gap-2 mt-1 text-sm">
              {rating != null && (
                <span className="text-black/70 dark:text-white/70">
                  ⭐ {rating.toFixed(1)}
                </span>
              )}
              {reviews != null && (
                <span className="text-black/60 dark:text-white/60">
                  ({reviews.toLocaleString()} reviews)
                </span>
              )}
              {hotelClass && (
                <span className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs">
                  {hotelClass}
                </span>
              )}
              {type && (
                <span className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs">
                  {type}
                </span>
              )}
            </div>
          </div>
        </div>
        {pricePerNight != null && (
          <span className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm font-bold bg-black/[0.03] dark:bg-white/[0.06]">
            {currency} {Math.round(pricePerNight).toLocaleString()} / night
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-black/70 dark:text-white/70">
          {description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          {checkInTime && (
            <p className="text-sm text-black/70 dark:text-white/70">
              <span className="font-semibold">Check-in:</span> {checkInTime}
            </p>
          )}
          {checkOutTime && (
            <p className="text-sm text-black/70 dark:text-white/70">
              <span className="font-semibold">Check-out:</span> {checkOutTime}
            </p>
          )}
          {address && (
            <p className="text-sm text-black/70 dark:text-white/70">
              <span className="font-semibold">Location:</span> {address}
            </p>
          )}
        </div>
        {visibleAmenities.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleAmenities.map((amenity, aIdx) => {
                const amenityName = asString(amenity["name"]) ?? asString(amenity) ?? "Amenity";
                return (
                  <span
                    key={aIdx}
                    className="flex items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs bg-white/50 dark:bg-white/5"
                  >
                    {getAmenityIcon(amenityName)}
                    {amenityName}
                  </span>
                );
              })}
              {allAmenities.length > 6 && (
                <span className="flex items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 font-semibold">
                  +{allAmenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {nearbyPlaces.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
            Nearby
          </p>
          <div className="flex flex-wrap gap-2">
            {nearbyPlaces.map((place, pIdx) => {
              const placeName = asString(place["name"]) ?? asString(place);
              const placeDistance = asString(place["distance"]);
              if (!placeName) return null;
              return (
                <span key={pIdx} className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs">
                  {placeName}
                  {placeDistance ? ` (${placeDistance})` : ""}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {bookingLink ? (
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-xs font-semibold border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
          >
            View / Book
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25 opacity-50 cursor-not-allowed"
          >
            View / Book
          </button>
        )}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25 bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <MapPin className="w-3.5 h-3.5" />
          View on Maps
        </a>
      </div>
    </article>
  );
};

export default HotelCard;
