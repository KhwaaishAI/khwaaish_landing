import { useState } from "react";
import type { FlightSearchParams } from "./types";

interface FlightSearchProps {
    onSearch: (params: FlightSearchParams) => void;
    isLoading: boolean;
}

export default function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
    const [departureFrom, setDepartureFrom] = useState("");
    const [arrivalTo, setArrivalTo] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [adults, setAdults] = useState(1);

    const handleSearch = () => {
        console.log("Search button clicked");
        console.log("Form values:", {
            departureFrom,
            arrivalTo,
            departureDate,
            adults,
        });

        const params: FlightSearchParams = {
            departureFrom: departureFrom || "",
            arrivalTo: arrivalTo || "",
            departureDate: departureDate || "",
            returnDate: "",
            cabinType: "",
            adults: adults || 1,
            selectedDepartureTime: "",
            maxStops: "",
        };

        console.log("Calling onSearch with params:", params);
        onSearch(params);
    };

    const swapLocations = () => {
        const temp = departureFrom;
        setDepartureFrom(arrivalTo);
        setArrivalTo(temp);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl border border-gray-700/80 p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Departure From */}
                <div className="relative">
                    <label className="block text-xs text-gray-400 mb-2">From</label>
                    <input
                        type="text"
                        value={departureFrom}
                        onChange={(e) => setDepartureFrom(e.target.value)}
                        placeholder="kolkata"
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Swap Button */}
                <div className="flex items-end justify-center">
                    <button
                        onClick={swapLocations}
                        className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors"
                        aria-label="Swap locations"
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                    </button>
                </div>

                {/* Arrival To */}
                <div className="relative">
                    <label className="block text-xs text-gray-400 mb-2">To</label>
                    <input
                        type="text"
                        value={arrivalTo}
                        onChange={(e) => setArrivalTo(e.target.value)}
                        placeholder="mumbai"
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Departure Date */}
                <div className="relative">
                    <label className="block text-xs text-gray-400 mb-2">Depart Date</label>
                    <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Adults */}
                <div className="relative">
                    <label className="block text-xs text-gray-400 mb-2">Adults</label>
                    <input
                        type="number"
                        min="1"
                        max="9"
                        value={adults}
                        onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50"
            >
                {isLoading ? "Searching..." : "Search"}
            </button>
        </div>
    );
}
