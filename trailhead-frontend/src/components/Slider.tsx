import React from "react";
import { Slider } from "@/components/ui/slider";
import type { Currency } from "./Navbar";

interface CurrencySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  selectedCurrency: Currency;
  min?: number;
  max?: number;
  step?: number;
}

const CurrencySlider: React.FC<CurrencySliderProps> = ({
  label,
  value,
  onChange,
  selectedCurrency,
  min = 0,
  max = 1000,
  step = 10,
}) => {
  return (
    <div className="w-full max-w-md p-4 bg-white/10 rounded-2xl shadow-md text-white">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">
          {selectedCurrency.symbol}
          {value.toLocaleString()}
        </span>
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        className="w-full"
      />
    </div>
  );
};

export default CurrencySlider;

