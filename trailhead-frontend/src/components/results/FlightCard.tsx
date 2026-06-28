import React, { useState } from "react";
import type { FlightOption } from "@/types/planner";

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

const pickField = (flight: UnknownRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asString(flight[key]);
    if (value) return value;
  }
  return undefined;
};

const pickNumber = (flight: UnknownRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const raw = flight[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
};

const formatSegments = (flight: UnknownRecord): UnknownRecord[] => {
  const segments = flight.segments ?? flight.legs;
  if (!Array.isArray(segments)) return [];
  return segments.map(asRecord).filter((item): item is UnknownRecord => Boolean(item));
};

interface FlightCardProps {
  flight: FlightOption;
  index: number;
  defaultCurrency?: string;
  globalBookingLink?: string;
}

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  index,
  defaultCurrency,
  globalBookingLink,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const record = flight as UnknownRecord & FlightOption;

  console.log(`[FlightCard ${index}] Flight object:`, record);

  const airline = pickField(record, ["airline", "carrier", "airlineName"]);
  const airlineLogo = pickField(record, ["airlineLogo", "airline_logo", "logo", "carrierLogo"]);
  const flightNumber = pickField(record, ["flightNumber"]);
  const price =
    pickField(record, ["price", "totalPrice", "amount"]) ??
    (pickNumber(record, ["price", "totalPrice", "amount"]) != null
      ? String(pickNumber(record, ["price", "totalPrice", "amount"]))
      : undefined);
  const currency =
    pickField(record, ["currency"]) ?? defaultCurrency;
  const duration = pickField(record, ["duration", "totalDuration"]);
  const departureTime = pickField(record, ["departureTime", "departure_time"]);
  const arrivalTime = pickField(record, ["arrivalTime", "arrival_time"]);
  const departureAirport = pickField(record, [
    "departureAirport",
    "from",
    "origin",
  ]);
  const arrivalAirport = pickField(record, [
    "arrivalAirport",
    "to",
    "destination",
  ]);
  const stops =
    pickField(record, ["stops"]) ??
    (pickNumber(record, ["stops", "stopCount"]) != null
      ? String(pickNumber(record, ["stops", "stopCount"]))
      : undefined);
  const bookingLink = pickField(record, [
    "bookingLink", "link", "url", "booking_link", "serpapi_link", "google_flights_url"
  ]) ?? globalBookingLink;
  console.log(`[FlightCard ${index}] bookingLink chosen:`, bookingLink);
  const segments = formatSegments(record);

  return (
    <article className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-black/35 shadow-sm p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {airlineLogo && !logoError && (
            <div className="rounded-lg border border-black/10 dark:border-white/15 w-10 h-10 flex items-center justify-center bg-white/70 dark:bg-white/5 overflow-hidden">
              <img
                src={airlineLogo}
                alt={airline ?? "Airline logo"}
                className="w-auto h-auto max-w-full max-h-full object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
              Flight {index + 1}
            </p>
            <h4 className="text-lg font-bold mt-0.5">
              {airline ?? "Airline not provided"}
            </h4>
            {flightNumber && (
              <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                {flightNumber}
              </p>
            )}
          </div>
        </div>
        {price && (
          <span className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm font-bold bg-black/[0.03] dark:bg-white/[0.06]">
            {currency ? `${currency} ` : ""}
            {price}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {departureAirport && arrivalAirport && (
          <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
            {departureAirport} → {arrivalAirport}
          </span>
        )}
        {departureTime && (
          <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
            Departs: {departureTime}
          </span>
        )}
        {arrivalTime && (
          <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
            Arrives: {arrivalTime}
          </span>
        )}
        {duration && (
          <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
            Duration: {duration}
          </span>
        )}
        {stops !== undefined && (
          <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
            Stops: {stops}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {segments.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        )}
        {bookingLink ? (
          <a
            href={bookingLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 text-xs font-semibold border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
          >
            Book / View
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25 opacity-50 cursor-not-allowed"
          >
            Book / View
          </button>
        )}
      </div>

      {expanded && segments.length > 0 && (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-3 space-y-2 bg-black/[0.02] dark:bg-white/[0.03]">
          {segments.map((segment, segIdx) => (
            <div
              key={segIdx}
              className="text-sm text-black/75 dark:text-white/75 border-b border-black/10 dark:border-white/10 last:border-0 pb-2 last:pb-0"
            >
              <p className="font-semibold">Segment {segIdx + 1}</p>
              <p>
                {pickField(segment, ["departureAirport", "from", "origin"]) ?? "—"} →{" "}
                {pickField(segment, ["arrivalAirport", "to", "destination"]) ?? "—"}
              </p>
              <p className="text-xs mt-0.5 text-black/60 dark:text-white/60">
                {[
                  pickField(segment, ["departureTime", "departure_time"]),
                  pickField(segment, ["arrivalTime", "arrival_time"]),
                  pickField(segment, ["duration"]),
                ]
                  .filter(Boolean)
                  .join(" · ") || "Timing not available"}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default FlightCard;
