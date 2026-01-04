import { useMemo, useState } from "react";
import AgodaBookingModal from "./AgodaBookingModal";
import BookingModal from "./BookingModal";

interface FlightResultsProps {
    agodaResults: any;
    bookingResults: any;
    isLoading: boolean;
}

interface ProviderOption {
    provider: "Agoda" | "Booking.com";
    price: number;
    rawDepartureTime: string;
    sessionId: string;
    deepLink: string;
    badges: string[];
    stops: number;
    duration: string;
}

interface GroupedFlight {
    id: string;
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    departureTime: string;
    departureCity: string;
    arrivalTime: string;
    arrivalCity: string;
    duration: string;
    stops: number;
    options: ProviderOption[];
    bestPrice: number;
}

const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    const cleaned = timeString.trim();
    if (cleaned.match(/^\d{1,2}:\d{2}$/)) {
        const parts = cleaned.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${minutes} ${suffix}`;
    }
    return cleaned.replace(/\u202f/g, " ").toUpperCase();
};

const parsePrice = (priceInput: any): number => {
    if (priceInput === undefined || priceInput === null) return 0;
    if (typeof priceInput === "number") return priceInput;
    const priceStr = String(priceInput);
    const matches = priceStr.match(/[\d,]+\.?\d*/g);
    if (matches && matches.length > 0) {
        const numbers = matches.map(m => parseFloat(m.replace(/,/g, ''))).filter(n => !isNaN(n));
        if (numbers.length > 0) return numbers[numbers.length - 1];
    }
    return 0;
};

const parseDuration = (dur: string) => {
    let minutes = 0;
    const hMatch = dur.match(/(\d+)h/);
    const mMatch = dur.match(/(\d+)m/);
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);
    return minutes || 9999;
};

const getMinutesFromTime = (t: string) => {
    const parts = t.replace(/\u202f/g, " ").split(' ');
    if (parts.length < 2) return 0; // fallback
    const [time, mod] = parts;
    let [h, m] = time.split(':').map(val => parseInt(val, 10));
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;

    if ((mod === 'PM' || mod === 'pm') && h < 12) h += 12;
    if ((mod === 'AM' || mod === 'am') && h === 12) h = 0;
    return h * 60 + m;
};

export default function FlightResults({
    agodaResults,
    bookingResults,
    isLoading
}: FlightResultsProps) {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBookingFlight, setSelectedBookingFlight] = useState<any>(null);

    const [isAgodaModalOpen, setIsAgodaModalOpen] = useState(false);
    const [selectedAgodaFlight, setSelectedAgodaFlight] = useState<any>(null);

    // Sort Logic
    const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'earliest'>('cheapest');
    const [showComparisonOnly, setShowComparisonOnly] = useState(false);

    const groupedFlights = useMemo(() => {
        const map: Record<string, GroupedFlight> = {};

        // --- Process Agoda ---
        if (agodaResults && agodaResults.flights) {
            const agodaSessionId = agodaResults.session_id || "";
            agodaResults.flights.forEach((flight: any) => {
                const depTime = formatTime(flight.departure_time);
                const arrTime = formatTime(flight.arrival_time);
                const airline = flight.airline || "Unknown";
                const depCity = flight.origin || flight.departure_code || "Origin";
                const arrCity = flight.destination || flight.arrival_code || "Dest";

                // Key: Airline + DepTime + Route
                const key = `${airline}_${depTime}_${depCity}_${arrCity}`.replace(/\s+/g, '').toUpperCase();
                const priceVal = flight.price_text || flight.price || flight.total_price || flight.amount || 0;

                if (!map[key]) {
                    map[key] = {
                        id: key,
                        airline,
                        airlineLogo: flight.logo_url || flight.airline_logo || "",
                        flightNumber: flight.flight_number || "",
                        departureTime: depTime,
                        departureCity: depCity,
                        arrivalTime: arrTime,
                        arrivalCity: arrCity,
                        duration: flight.duration || "--",
                        stops: parseInt(flight.stops || (flight.layover ? '1' : '0')) || 0,
                        options: [],
                        bestPrice: 9999999
                    };
                }

                const price = parsePrice(priceVal);
                map[key].options.push({
                    provider: "Agoda",
                    price,
                    rawDepartureTime: flight.departure_time,
                    sessionId: agodaSessionId,
                    deepLink: flight.deep_link || "",
                    badges: Array.isArray(flight.badges) ? flight.badges : [],
                    stops: parseInt(flight.stops) || 0,
                    duration: flight.duration || "--"
                });
                if (price > 0 && price < map[key].bestPrice) map[key].bestPrice = price;
            });
        }

        // --- Process Booking.com ---
        if (bookingResults && bookingResults.flights) {
            const bookingSessionId = bookingResults.session_id || "";
            bookingResults.flights.forEach((flight: any) => {
                const rawTime = flight.departure_time || flight.departureDate || "";
                const depTime = formatTime(rawTime);
                const arrTime = formatTime(flight.arrival_time || flight.arrivalDate);
                const airline = flight.airline || "Unknown";
                const depCity = flight.departure_airport || flight.origin || "Origin";
                const arrCity = flight.arrival_airport || flight.destination || "Dest";

                const key = `${airline}_${depTime}_${depCity}_${arrCity}`.replace(/\s+/g, '').toUpperCase();
                const priceVal = flight.price || flight.price_text || flight.amount || flight.totalAmount || 0;

                if (!map[key]) {
                    map[key] = {
                        id: key,
                        airline,
                        airlineLogo: flight.airline_logo || "",
                        flightNumber: flight.flight_number || "",
                        departureTime: depTime,
                        departureCity: depCity,
                        arrivalTime: arrTime,
                        arrivalCity: arrCity,
                        duration: flight.duration || "--",
                        stops: flight.stops || 0,
                        options: [],
                        bestPrice: 9999999
                    };
                }

                const price = parsePrice(priceVal);
                map[key].options.push({
                    provider: "Booking.com",
                    price,
                    rawDepartureTime: rawTime,
                    sessionId: bookingSessionId,
                    deepLink: "",
                    badges: flight.has_flexible_badge ? ["Flexible"] : [],
                    stops: flight.stops || 0,
                    duration: flight.duration || "--"
                });
                if (price > 0 && price < map[key].bestPrice) map[key].bestPrice = price;
            });
        }

        return Object.values(map);
    }, [agodaResults, bookingResults]);

    // Derived Sorted/Filtered List
    const displayedFlights = useMemo(() => {
        let list = [...groupedFlights];

        // Filter: Comparisons only
        if (showComparisonOnly) {
            list = list.filter(f => f.options.length > 1);
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'cheapest') {
                return a.bestPrice - b.bestPrice;
            } else if (sortBy === 'fastest') {
                return parseDuration(a.duration) - parseDuration(b.duration);
            } else if (sortBy === 'earliest') {
                return getMinutesFromTime(a.departureTime) - getMinutesFromTime(b.departureTime);
            }
            return 0;
        });

        return list;
    }, [groupedFlights, sortBy, showComparisonOnly]);


    const fastestFlightId = useMemo(() => {
        if (groupedFlights.length === 0) return null;
        let fastest = groupedFlights[0];
        let minMins = 99999;
        groupedFlights.forEach(f => {
            const mins = parseDuration(f.duration);
            if (mins < minMins) {
                minMins = mins;
                fastest = f;
            }
        });
        return fastest.id;
    }, [groupedFlights]);

    // Absolute cheapest in entire set
    const cheapestFlightId = useMemo(() => {
        if (groupedFlights.length === 0) return null;
        let cheapest = groupedFlights[0];
        groupedFlights.forEach(f => {
            if (f.bestPrice < cheapest.bestPrice) cheapest = f;
        });
        return cheapest.id;
    }, [groupedFlights]);

    const handleOptionSelect = (flight: GroupedFlight, option: ProviderOption) => {
        const unifiedFlightData = {
            ...flight,
            ...option,
            provider: option.provider
        };

        if (option.provider === "Booking.com") {
            setSelectedBookingFlight(unifiedFlightData);
            setIsBookingModalOpen(true);
        } else if (option.provider === "Agoda") {
            setSelectedAgodaFlight(unifiedFlightData);
            setIsAgodaModalOpen(true);
        } else {
            window.open(option.deepLink, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 max-w-5xl mx-auto mt-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-900/50 border border-gray-800 rounded-3xl p-6 h-40"></div>
                ))}
            </div>
        );
    }

    if (groupedFlights.length === 0) {
        if (!agodaResults && !bookingResults) return null;
        return (
            <div className="text-center py-12 bg-gray-900/30 rounded-3xl border border-gray-800 mt-8">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                <h3 className="text-xl font-bold text-white mb-2">No flights found</h3>
                <p className="text-gray-400">Try changing your dates or airports.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <h2 className="text-2xl font-bold text-white">
                    Found {displayedFlights.length} Flights
                </h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSortBy('cheapest')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${sortBy === 'cheapest' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                    >
                        Price: Low to High
                    </button>
                    <button
                        onClick={() => setSortBy('fastest')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${sortBy === 'fastest' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                    >
                        Fastest
                    </button>
                    <button
                        onClick={() => setSortBy('earliest')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${sortBy === 'earliest' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                    >
                        Earliest Departure
                    </button>
                    <button
                        onClick={() => setShowComparisonOnly(!showComparisonOnly)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showComparisonOnly ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                    >
                        Compare Only ({groupedFlights.filter(f => f.options.length > 1).length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {displayedFlights.map((flight) => {
                    const isCheapest = flight.id === cheapestFlightId;
                    const isFastest = flight.id === fastestFlightId;

                    return (
                        <div
                            key={flight.id}
                            className={`group relative bg-[#13161c] border rounded-3xl p-5 sm:p-6 transition-all duration-300 overflow-hidden ${isCheapest ? 'border-green-500/30 shadow-green-900/10' : 'border-gray-800 hover:border-gray-600 shadow-xl'}`}
                        >
                            {/* Banners */}
                            <div className="absolute top-0 left-0 flex flex-col items-start gap-1 z-10">
                                {isCheapest && (
                                    <div className="bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wide shadow-sm">
                                        Cheapest
                                    </div>
                                )}
                                {isFastest && !isCheapest && (
                                    <div className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wide shadow-sm">
                                        Fastest
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pl-2">
                                {/* Left: Airline & Info */}
                                <div className="flex items-center gap-4 w-full lg:w-[35%]">
                                    <div className="w-14 h-14 bg-white rounded-xl p-2 flex items-center justify-center shrink-0 shadow-inner">
                                        {flight.airlineLogo ? (
                                            <img src={flight.airlineLogo} alt={flight.airline} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-gray-400 text-xs text-center font-bold leading-tight">{flight.airline}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-tight">{flight.airline}</h3>
                                        {flight.flightNumber && <p className="text-xs text-gray-500 mt-0.5">{flight.flightNumber}</p>}
                                    </div>
                                </div>

                                {/* Center: Schedule */}
                                <div className="flex items-center justify-center gap-6 w-full lg:w-[40%]">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-white">{flight.departureTime}</div>
                                        <div className="text-xs font-mono text-gray-500 mt-1">{flight.departureCity}</div>
                                    </div>

                                    <div className="flex flex-col items-center w-32">
                                        <div className="text-[10px] text-gray-400 mb-1">{flight.duration}</div>
                                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 border-2 border-gray-600 rounded-full"></div>
                                        </div>
                                        <div className="text-[10px] text-green-400 mt-1 font-medium">
                                            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-xl font-bold text-white">{flight.arrivalTime}</div>
                                        <div className="text-xs font-mono text-gray-500 mt-1">{flight.arrivalCity}</div>
                                    </div>
                                </div>

                                {/* Right: Comparison Options */}
                                <div className="flex flex-col gap-2 w-full lg:w-[25%]">
                                    {flight.options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-2 border border-gray-800 hover:border-gray-700 transition-colors">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-bold uppercase ${opt.provider === 'Agoda' ? 'text-blue-400' : 'text-teal-400'}`}>
                                                    {opt.provider}
                                                </span>
                                                <span className="font-bold text-white text-lg">
                                                    ₹{opt.price.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleOptionSelect(flight, opt)}
                                                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${opt.provider === 'Agoda' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                                            >
                                                Book
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedBookingFlight && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    flight={selectedBookingFlight}
                    initialSessionId={selectedBookingFlight.sessionId || ""}
                />
            )}
            {selectedAgodaFlight && (
                <AgodaBookingModal
                    isOpen={isAgodaModalOpen}
                    onClose={() => setIsAgodaModalOpen(false)}
                    flight={selectedAgodaFlight}
                    initialSessionId={selectedAgodaFlight.sessionId || ""}
                />
            )}
        </div>
    );
}
