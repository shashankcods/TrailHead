import React, { useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Slider } from "@/components/ui/slider";
import { currencies, type Currency } from "./Navbar";

interface BudgetPlannerProps {
  budget: number;
  onBudgetChange: (value: number) => void;
  onAllocationChange?: (value: Record<CategoryKey, number>) => void;
  selectedCurrency: Currency;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  min?: number;
  max?: number;
  step?: number;
}

type CategoryKey = "travel" | "accommodation" | "food" | "activities";

const categoryMeta: Record<CategoryKey, { title: string; description: string }> = {
  travel: { title: "Travel", description: "Flights, transport, local commute" },
  accommodation: { title: "Accommodation", description: "Hotels, hostels, rentals" },
  food: { title: "Food & Dining", description: "Restaurants, groceries, drinks" },
  activities: { title: "Events & Activities", description: "Tours, tickets, experiences" },
};

const toPercent = (val: number) => Math.max(0, Math.min(100, val));

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budget,
  onBudgetChange,
  onAllocationChange,
  selectedCurrency,
  setSelectedCurrency,
  min = 1000,
  max = 500000,
  step = 100,
}) => {
  const [allocations, setAllocations] = useState<Record<CategoryKey, number>>({
    travel: 25,
    accommodation: 25,
    food: 25,
    activities: 25,
  });

  const total = useMemo(
    () =>
      allocations.travel +
      allocations.accommodation +
      allocations.food +
      allocations.activities,
    [allocations]
  );

  React.useEffect(() => {
    onAllocationChange?.(allocations);
  }, [allocations, onAllocationChange]);

  const rebalanceCategory = (category: CategoryKey, nextPercent: number) => {
    const bounded = toPercent(nextPercent);
    const otherKeys = (Object.keys(allocations) as CategoryKey[]).filter(
      (k) => k !== category
    );
    const remaining = 100 - bounded;
    const otherCurrentTotal = otherKeys.reduce((sum, key) => sum + allocations[key], 0);

    const next = { ...allocations, [category]: bounded };

    if (otherCurrentTotal === 0) {
      const evenShare = Math.floor(remaining / otherKeys.length);
      otherKeys.forEach((key, index) => {
        next[key] = index === otherKeys.length - 1 ? remaining - evenShare * index : evenShare;
      });
      setAllocations(next);
      return;
    }

    let distributed = 0;
    otherKeys.forEach((key, index) => {
      if (index === otherKeys.length - 1) {
        next[key] = Math.max(0, remaining - distributed);
      } else {
        const value = Math.round((allocations[key] / otherCurrentTotal) * remaining);
        next[key] = value;
        distributed += value;
      }
    });

    setAllocations(next);
  };

  const formatMoney = (value: number) => {
    // For AED/KWD, use code first to avoid RTL issues; otherwise symbol first
    if (["AED", "KWD"].includes(selectedCurrency.code)) {
      return `${selectedCurrency.code} ${Math.round(value).toLocaleString()}`
    }
    return `${selectedCurrency.symbol}${Math.round(value).toLocaleString()}`
  };

  const resetBalanced = () =>
    setAllocations({
      travel: 25,
      accommodation: 25,
      food: 25,
      activities: 25,
    });

  return (
    <div className="w-full max-w-6xl space-y-4">
      <div className="th-soft-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="th-title">Maximum Budget</h3>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">{formatMoney(budget)}</span>
            <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
              <div className="relative w-32">
                <Listbox.Button className="relative w-full cursor-pointer bg-white dark:bg-black text-black dark:text-white border border-black/25 dark:border-white/30 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white flex justify-between items-center">
                  {selectedCurrency.symbol} {selectedCurrency.code}
                  <ChevronUpDownIcon className="w-5 h-5 ml-2 text-black dark:text-white" />
                </Listbox.Button>
                <Transition
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 w-full bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-lg max-h-60 overflow-auto z-50 border border-black/20 dark:border-white/20">
                    {currencies.map((currency) => (
                      <Listbox.Option
                        key={currency.code}
                        value={currency}
                        className={({ active }) =>
                          `cursor-pointer select-none relative px-4 py-2 ${
                            active
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : ""
                          }`
                        }
                      >
                        {currency.symbol} {currency.code}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[budget]}
          onValueChange={(val) => onBudgetChange(val[0])}
          className="w-full"
        />
        <div className="mt-2 flex justify-between th-subtitle">
          <span>{formatMoney(min)}</span>
          <span>{formatMoney(max)}</span>
        </div>
      </div>

      <div className="th-soft-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="th-title">Budget Categories</h3>
          <button
            type="button"
            onClick={resetBalanced}
            className="px-3 py-2 rounded-lg border border-black/25 dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Reset to Balanced
          </button>
        </div>
        <p className="th-subtitle mb-4">
          Allocate your budget across categories. Total should remain 100%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(categoryMeta) as CategoryKey[]).map((key) => {
            const percentage = allocations[key];
            const amount = (budget * percentage) / 100;

            return (
              <div
                key={key}
                className="th-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-semibold">{categoryMeta[key].title}</div>
                    <div className="th-subtitle">
                      {categoryMeta[key].description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="th-subtitle">
                      {formatMoney(amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[percentage]}
                    onValueChange={(val) => rebalanceCategory(key, val[0])}
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-black/60 dark:text-white/60">
                    <span>0%</span>
                    <span>{total}% total</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;

