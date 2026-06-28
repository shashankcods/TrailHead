import React from "react";

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
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, index, defaultCurrency }) => {
  const record = hotel;

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
  const amenities = asArray(record["amenities"]).slice(0, 6);
  const nearbyPlaces = asArray(record["nearby_places"]).slice(0, 3);
  const address = pickField(record, ["address", "location", "vicinity"]);
  const bookingLink = pickField(record, ["link", "url", "booking_link", "bookingLink", "website"]);
  
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

  return (
    <article className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-black/35 shadow-sm p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4 items-start">
          {thumbnail && (
            <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/15 w-24 h-24 flex-shrink-0">
              <img src={thumbnail} alt={hotelName ?? "Hotel"} className="w-full h-full object-cover" />
            </div>
          )}
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
        {amenities.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, aIdx) => {
                const amenityName = asString(amenity["name"]) ?? asString(amenity) ?? "Amenity";
                return (
                  <span key={aIdx} className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs">
                    {amenityName}
                  </span>
                );
              })}
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
      </div>
    </article>
  );
};

export default HotelCard;
