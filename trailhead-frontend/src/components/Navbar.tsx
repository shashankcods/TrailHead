import React from "react"
import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDownIcon } from "@heroicons/react/24/solid"
import { Link } from "react-router-dom"

export type Currency = {
  code: string
  symbol: string
}

// using chosen currencies for now to implement currency conversion feature
export const currencies: Currency[] = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "AED", symbol: "د.إ" },
  { code: "KWD", symbol: "د.ك" },
]

interface NavbarProps {
  selectedCurrency: Currency
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

const Navbar: React.FC<NavbarProps> = ({
  selectedCurrency,
  setSelectedCurrency,
}) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/5">
      <Link to="/">
      {/* navbar logo redirecting to landing page */}
        <h1 className="text-white text-4xl font-bold font-family-ubuntu cursor-pointer">
          TrailHead
        </h1>
      </Link>

      <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
        <div className="relative w-32">
          {/* navbar currency button */}
          <Listbox.Button className="relative w-full cursor-pointer bg-black/20 text-white border border-gray-400 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-white flex justify-between items-center">
            {selectedCurrency.symbol} {selectedCurrency.code}
            <ChevronUpDownIcon className="w-5 h-5 ml-2 text-white" />
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* dropdown menu with list of currencies */}
            <Listbox.Options className="absolute mt-1 w-full bg-black/90 text-white rounded-md shadow-lg max-h-60 overflow-auto z-50">
              {currencies.map((currency) => (
                <Listbox.Option
                  key={currency.code}
                  value={currency}
                  className={({ active }) =>
                    `cursor-pointer select-none relative px-4 py-2 ${
                      active ? "bg-gray-700" : ""
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
    </nav>
  )
}

export default Navbar


