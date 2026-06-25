import React from "react";
import type { PlannerData, PlannerFlights } from "@/types/planner";
import FlightCard from "@/components/results/FlightCard";

interface TravelViewProps {
  plannerData: PlannerData;
}

type FlightsRecord = PlannerFlights & Record<string, unknown>;

const readFlightsMeta = (plannerData: PlannerData) => {
  const trip = plannerData.trip ?? {};
  const raw = (plannerData.flights ?? {}) as FlightsRecord;

  return {
    route: raw.route as string | undefined,
    departureAirport:
      (raw.departureAirport as string | undefined) ??
      (raw.departure_airport as string | undefined),
    arrivalAirport:
      (raw.arrivalAirport as string | undefined) ??
      (raw.arrival_airport as string | undefined),
    outboundDate:
      (raw.outboundDate as string | undefined) ??
      (raw.outbound_date as string | undefined) ??
      trip.start_date,
    returnDate:
      (raw.returnDate as string | undefined) ??
      (raw.return_date as string | undefined) ??
      trip.end_date,
    adults: raw.adults ?? trip.adults,
    currency: (raw.currency as string | undefined) ?? "USD",
    bookingLink:
      (raw.bookingLink as string | undefined) ??
      (raw.booking_link as string | undefined),
    budgetRange: raw.budgetRange,
    totalResults:
      raw.totalResults ??
      (raw.total_results as number | undefined),
    flights: raw.flights ?? [],
  };
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statItem = (label: string, value: string) => (
  <div className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2.5 bg-white/70 dark:bg-black/35">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
      {label}
    </p>
    <p className="font-bold mt-0.5 text-sm">{value}</p>
  </div>
);

const formatBudgetNumber = (value: number) => {
  return Math.round(value).toLocaleString();
};

const TravelView: React.FC<TravelViewProps> = ({ plannerData }) => {
  const trip = plannerData.trip ?? {};
  const flights = readFlightsMeta(plannerData);
  const flightList = flights.flights ?? [];
  const hasResults = flightList.length > 0;
  const bookingLink = flights.bookingLink;
  const currency = flights.currency ?? "USD";
  const budgetMin = flights.budgetRange?.min;
  const budgetMax = flights.budgetRange?.max;

  const budgetLabel =
    budgetMin != null && budgetMax != null
      ? `${currency} ${formatBudgetNumber(budgetMin)}–${formatBudgetNumber(budgetMax)}`
      : budgetMin != null
        ? `${currency} ${formatBudgetNumber(budgetMin)}+`
        : budgetMax != null
          ? `Up to ${currency} ${formatBudgetNumber(budgetMax)}`
          : "Not available";

  const routeLabel =
    flights.route ??
    (trip.source && trip.destination
      ? `${trip.source} ↔ ${trip.destination}`
      : trip.source || trip.destination || "Not available");

  const datesLabel = (() => {
    const outbound = formatDate(flights.outboundDate);
    const ret = formatDate(flights.returnDate);
    if (outbound && ret) return `${outbound} → ${ret}`;
    if (outbound) return outbound;
    if (ret) return ret;
    return "Not available";
  })();

  const travelersLabel = (() => {
    const adults = flights.adults ?? trip.adults;
    if (adults == null) return "Not available";
    return `${adults} adult${adults === 1 ? "" : "s"}`;
  })();

  const resultsLabel = hasResults
    ? `${flightList.length} live flight${flightList.length === 1 ? "" : "s"}`
    : flights.totalResults === 0 || !hasResults
      ? "No live results"
      : flights.totalResults != null
        ? `${flights.totalResults} live flight${flights.totalResults === 1 ? "" : "s"}`
        : "No live results";

  const openBooking = () => {
    if (bookingLink) {
      window.open(bookingLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Travel Routes & Flights
        </h3>
        <p className="th-subtitle mt-1 text-sm">
          Review the route, dates, budget, and live flight search link for this trip.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 shadow-sm p-4 md:p-5">
        <h4 className="font-bold text-base mb-3">Travel Summary</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {statItem("Route", routeLabel)}
          {statItem(
            "Airports",
            flights.departureAirport && flights.arrivalAirport
              ? `${flights.departureAirport} → ${flights.arrivalAirport}`
              : "Not available"
          )}
          {statItem("Dates", datesLabel)}
          {statItem("Travelers", travelersLabel)}
          {statItem("Budget", budgetLabel)}
          {statItem("Results", resultsLabel)}
        </div>
      </section>

      {hasResults ? (
        <section className="space-y-3">
          <h4 className="font-bold text-base">Flight Results</h4>
          <div className="space-y-3">
            {flightList.map((flight, index) => (
              <FlightCard
                key={index}
                flight={flight}
                index={index}
                defaultCurrency={currency}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 shadow-sm p-4 md:p-5 space-y-3">
          <h4 className="font-bold text-base">No live flight results returned.</h4>
          <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
            Live flight cards were not returned for this route yet. Search the same
            route directly on Google Flights to check current fares and availability.
            {budgetMin != null || budgetMax != null
              ? ` Your planned budget is ${budgetLabel}.`
              : ""}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openBooking}
              disabled={!bookingLink}
              className="rounded-xl px-4 py-2.5 text-sm font-bold border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search flights on Google
            </button>
            {!bookingLink && (
              <p className="text-xs text-black/55 dark:text-white/55">
                Google Flights link unavailable.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default TravelView;
