import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FlightSearch from "./FlightSearch";
import FlightResults from "./FlightResults";
import type { FlightSearchParams, AgodaFlightRequest, BookingFlightRequest } from "./types";
import { searchFlightsSimultaneously } from "./api";
import { getAirportCode } from "./airportCodes";

export default function Flight() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [agodaResults, setAgodaResults] = useState<any>(null);
    const [bookingResults, setBookingResults] = useState<any>(null);

    const handleSearch = async (params: FlightSearchParams) => {
        console.log("handleSearch called with params:", params);
        setIsLoading(true);
        setAgodaResults(null);
        setBookingResults(null);

        try {
            const departureCode = getAirportCode(params.departureFrom);
            const arrivalCode = getAirportCode(params.arrivalTo);

            console.log("Airport codes:", {
                departureFrom: params.departureFrom,
                departureCode,
                arrivalTo: params.arrivalTo,
                arrivalCode,
            });

            const agodaParams: AgodaFlightRequest = {
                departure_from: departureCode || "",
                arrival_to: arrivalCode || "",
                depart_date: params.departureDate || "",
                return_date: "",
                cabin_type: "",
                adults: params.adults || 1,
                selected_departure_time: "",
                max_stops: "",
            };

            const bookingParams: BookingFlightRequest = {
                from_destination: departureCode || "",
                to_destination: arrivalCode || "",
                date: params.departureDate || "",
                number_of_people: params.adults || 1,
            };

            console.log("Prepared API params:");
            console.log("Agoda:", agodaParams);
            console.log("Booking:", bookingParams);

            const results = await searchFlightsSimultaneously(agodaParams, bookingParams);

            console.log("API Results received:", results);
            setAgodaResults(results.agoda);
            setBookingResults(results.booking);
        } catch (error) {
            console.error("Error searching flights:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        <span>Back to Home</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/LOGO.png"
                            alt="Khwaaish AI"
                            className="h-10 w-auto"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Flight Search</h1>
                    <p className="text-gray-400">
                        Search and compare flights from multiple providers
                    </p>
                </div>

                {/* Search Form */}
                <FlightSearch onSearch={handleSearch} isLoading={isLoading} />

                {/* Results */}
                <FlightResults
                    agodaResults={agodaResults}
                    bookingResults={bookingResults}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
}
