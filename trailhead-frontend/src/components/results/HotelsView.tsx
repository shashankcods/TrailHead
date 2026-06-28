import React from "react";
import type { PlannerData } from "@/types/planner";
import HotelCard from "@/components/results/HotelCard";

interface HotelsViewProps {
  plannerData: PlannerData;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
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

const formatBudgetNumber = (value: number) => {
  return Math.round(value).toLocaleString();
};

const statItem = (label: string, value: string) => (
  <div className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2.5 bg-white/70 dark:bg-black/35">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
      {label}
    </p>
    <p className="font-bold mt-0.5 text-sm">{value}</p>
  </div>
);

const HotelsView: React.FC<HotelsViewProps> = ({ plannerData }) => {
  const trip = plannerData.trip ?? {};
  const hotelsRaw = plannerData.hotels;
  const hotelsRecord = asRecord(hotelsRaw);
  const hotelsArray = (() => {
    if (!hotelsRecord || !hotelsRecord.hotels) return [];
    if (!Array.isArray(hotelsRecord.hotels)) return [];
    return hotelsRecord.hotels.map(asRecord).filter((item): item is UnknownRecord => Boolean(item));
  })();
  const hasResults = hotelsArray.length > 0;
  const destination = (() => {
    const d = hotelsRecord?.destination;
    if (typeof d === "string") return d;
    return trip.destination;
  })();
  const adults = (() => {
    const a = hotelsRecord?.adults;
    if (typeof a === "number") return a;
    return trip.adults;
  })();
  const startDate = trip.start_date;
  const endDate = trip.end_date;
  const totalResults = (() => {
    const t = hotelsRecord?.total_results;
    if (typeof t === "number") return t;
    return hotelsArray.length;
  })();

  // Try to get budget range from hotels data or budgets allocation
  const budgets = plannerData.budgets;
  let budgetLabel = "Budget not specified";
  let defaultCurrency = "USD";
  
  // First try to get currency from hotels data
  const hotelCurrency = (() => {
    const c = hotelsRecord?.currency;
    if (typeof c === "string") return c;
    return undefined;
  })();
  defaultCurrency = hotelCurrency ?? budgets?.currency ?? "USD";
  
  // Try budget range from hotels data first
  const hotelsBudgetRange = hotelsRecord?.budgetRange;
  if (hotelsBudgetRange && typeof hotelsBudgetRange === "object") {
    const min = "min" in hotelsBudgetRange ? Number(hotelsBudgetRange.min) : undefined;
    const max = "max" in hotelsBudgetRange ? Number(hotelsBudgetRange.max) : undefined;
    if (max != null) {
      budgetLabel = `Up to ${defaultCurrency} ${formatBudgetNumber(max)} / night`;
    } else if (min != null && min > 0) {
      budgetLabel = `${defaultCurrency} ${formatBudgetNumber(min)}+ / night`;
    }
  } else {
    // Fallback to budgets allocation
    const accommodationBudget = budgets?.allocations?.accommodation;
    if (accommodationBudget != null) {
      const trip = plannerData.trip ?? {};
      const tripDays = trip.trip_days ?? 1;
      const adults = trip.adults ?? 1;
      const maxBudget = Math.round(accommodationBudget / tripDays / adults);
      budgetLabel = `Up to ${defaultCurrency} ${formatBudgetNumber(maxBudget)} / night`;
    }
  }

  const travelersLabel = adults != null ? `${adults} adult${adults === 1 ? "" : "s"}` : "Travelers not specified";
  const datesLabel = () => {
    const checkIn = formatDate(startDate);
    const checkOut = formatDate(endDate);
    if (checkIn && checkOut) return `${checkIn} → ${checkOut}`;
    if (checkIn) return checkIn;
    if (checkOut) return checkOut;
    return "Dates not specified";
  };
  const resultsLabel = hasResults
    ? `${hotelsArray.length} hotel${hotelsArray.length === 1 ? "" : "s"} found`
    : totalResults === 0 ? "No hotels found" : `${totalResults} hotel${totalResults === 1 ? "" : "s"} found`;

  // Check if there's a destination-level booking link
  const bookingLink = (() => {
    const bl = hotelsRecord?.booking_link ?? hotelsRecord?.link;
    if (typeof bl === "string") return bl;
    return undefined;
  })();

  return (
    <div className="space-y-4">
      <header>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Hotels & Stays
        </h3>
        <p className="th-subtitle mt-1 text-sm">
          Review accommodation options for this trip.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 shadow-sm p-4 md:p-5">
        <h4 className="font-bold text-base mb-3">Stay Summary</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {statItem("Destination", destination ?? "Destination not specified")}
          {statItem("Check-in → Check-out", datesLabel())}
          {statItem("Travelers", travelersLabel)}
          {statItem("Budget", budgetLabel)}
          {statItem("Results", resultsLabel)}
        </div>
      </section>

      {hasResults ? (
        <section className="space-y-3">
          <h4 className="font-bold text-base">Hotel Options</h4>
          <div className="space-y-3">
            {hotelsArray.map((hotel, index) => (
              <HotelCard
                key={index}
                hotel={hotel}
                index={index}
                defaultCurrency={defaultCurrency}
                destination={destination}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 shadow-sm p-4 md:p-5 space-y-3">
          <h4 className="font-bold text-base">No hotel results returned.</h4>
          <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
            Try checking accommodation manually for this destination.
          </p>
          {bookingLink && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-4 py-2.5 text-sm font-bold border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
              >
                Search Hotels
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default HotelsView;
