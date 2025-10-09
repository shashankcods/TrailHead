import React from "react";
import type { Currency } from "./Navbar";

export interface Restaurant {
  name: string;
  address: string;
  rating: number;
  totalReviews: number;
  priceLevel: number | string;
  googleMapsUrl: string;
}

interface FoodProps {
  restaurants: Restaurant[];
  selectedCurrency: Currency; // 👈 added
}

const FoodInsights: React.FC<FoodProps> = ({ restaurants, selectedCurrency }) => {
  const renderPriceLevel = (price: number | string) => {
    // if priceLevel is numeric, repeat the currency symbol accordingly
    if (typeof price === "number") return selectedCurrency.symbol.repeat(price);
    return price;
  };

  return (
    <div className="w-full mt-4 mb-10 p-4">
      <h3 className="text-white text-2xl font-bold mb-6 text-center">
        Top Restaurants in Tokyo
      </h3>
      <div className="flex flex-col gap-4 px-2">
        {restaurants.slice(0, 4).map((restaurant, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-white/10 via-white/5 to-transparent
            backdrop-blur-2xl
            border border-white/20
            rounded-xl p-5 text-white text-left
            hover:bg-white/20
            transition-all duration-300
            w-100
            h-48
            mx-auto"
        >
            <div className="font-bold text-lg mb-1 line-clamp-2">
              {restaurant.name}
            </div>
            <div className="text-xs text-gray-300 mb-2 line-clamp-2">
              {restaurant.address}
            </div>
            <div className="flex items-center text-sm mb-2">
              <span className="text-yellow-400 mr-2">⭐ {restaurant.rating}</span>
              <span className="text-gray-400">
                ({restaurant.totalReviews} reviews)
              </span>
            </div>
            <div className="text-sm mb-3">
              {renderPriceLevel(restaurant.priceLevel)}
            </div>
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline"
            >
              View on Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodInsights;




