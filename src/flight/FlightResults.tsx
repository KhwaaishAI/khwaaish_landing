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

    // 1. Handle explicit AM/PM
    const amPmMatch = cleaned.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
    if (amPmMatch) {
        // Normalize spacing and case. parseInt removes leading zeros (07 -> 7)
        return `${parseInt(amPmMatch[1], 10)}:${amPmMatch[2]} ${amPmMatch[3].toUpperCase()}`;
    }

    // 2. Handle ISO or 24h "HH:MM(:SS)"
    // Matches 14:00, 14:00:00, 2023-10-10T14:00:00
    const timeMatch = cleaned.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2];
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
        const allOptions: any[] = [];
        const agodaSessionId = agodaResults?.session_id || "";
        const bookingSessionId = bookingResults?.session_id || "";

        const resolveAirlineName = (flight: any) => {
            let name = flight.airline || flight.airline_name || flight.carrier_name || flight.carrierName || "";
            if (name && name.toLowerCase() !== "unknown") return name;

            // Try to extract from logo URL if name is unknown
            const logo = (flight.logo_url || flight.airline_logo || "").toLowerCase();
            if (logo.includes("/ai.") || logo.includes("air-india") || logo.includes("air%20india")) return "Air India";
            if (logo.includes("/6e.") || logo.includes("indigo")) return "IndiGo";
            if (logo.includes("/sg.") || logo.includes("spicejet")) return "SpiceJet";
            if (logo.includes("/uk.") || logo.includes("vistara")) return "Vistara";
            if (logo.includes("/qp.") || logo.includes("akasa")) return "Akasa Air";
            if (logo.includes("/g8.") || logo.includes("goair")) return "Go First";
            if (logo.includes("/i5.") || logo.includes("airasia")) return "AirAsia India";

            return "Unknown";
        };

        const getFallbackLogo = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes("indigo")) return "https://images.seeklogo.com/logo-png/31/1/indigo-airlines-logo-png_seeklogo-317426.png";
            if (n.includes("spicejet")) return "https://logos-world.net/wp-content/uploads/2023/01/SpiceJet-Logo.jpg";
            if (n.includes("akasa")) return "https://upload.wikimedia.org/wikipedia/commons/2/22/Akasa_Air_logo_with_slogan.png";
            if (n.includes("air india")) return "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Air_India_Logo.svg/512px-Air_India_Logo.svg.png";
            if (n.includes("vistara")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vistara_logo.svg/512px-Vistara_logo.svg.png";
            if (n.includes("go first") || n.includes("goair")) return "https://logos.skyscnr.com/images/airlines/favicon/G8.png";
            if (n.includes("airasia")) return "https://logos.skyscnr.com/images/airlines/favicon/I5.png";
            return "";
        };

        // Collect Agoda Options
        if (agodaResults?.flights) {
            agodaResults.flights.forEach((flight: any) => {
                const name = resolveAirlineName(flight);
                allOptions.push({
                    provider: "Agoda",
                    airline: name,
                    airlineLogo: flight.logo_url || flight.airline_logo || getFallbackLogo(name),
                    flightNumber: flight.flight_number || "",
                    departureTime: formatTime(flight.departure_time),
                    arrivalTime: formatTime(flight.arrival_time),
                    departureCity: flight.origin || flight.departure_code || "Origin",
                    arrivalCity: flight.destination || flight.arrival_code || "Dest",
                    duration: flight.duration || "--",
                    stops: parseInt(flight.stops || (flight.layover ? '1' : '0')) || 0,
                    price: parsePrice(flight.price_text || flight.price || flight.total_price || flight.amount || 0),
                    sessionId: agodaSessionId,
                    deepLink: flight.deep_link || "",
                    badges: Array.isArray(flight.badges) ? flight.badges : [],
                    rawTime: flight.departure_time
                });
            });
        }

        // Collect Booking.com Options
        if (bookingResults?.flights) {
            bookingResults.flights.forEach((flight: any) => {
                const name = resolveAirlineName(flight);
                allOptions.push({
                    provider: "Booking.com",
                    airline: name,
                    airlineLogo: flight.airline_logo || flight.logo_url || getFallbackLogo(name),
                    flightNumber: flight.flight_number || "",
                    departureTime: formatTime(flight.departure_time || flight.departureDate || ""),
                    arrivalTime: formatTime(flight.arrival_time || flight.arrivalDate || ""),
                    departureCity: flight.departure_airport || flight.origin || "Origin",
                    arrivalCity: flight.arrival_airport || flight.destination || "Dest",
                    duration: flight.duration || "--",
                    stops: flight.stops || 0,
                    price: parsePrice(flight.price || flight.price_text || flight.amount || flight.totalAmount || 0),
                    sessionId: bookingSessionId,
                    deepLink: "",
                    badges: flight.has_flexible_badge ? ["Flexible"] : [],
                    rawTime: flight.departure_time || flight.departureDate
                });
            });
        }

        const groups: GroupedFlight[] = [];

        allOptions.forEach(opt => {
            const matchIndex = groups.findIndex(g =>
                g.departureTime === opt.departureTime &&
                g.departureCity === opt.departureCity &&
                g.arrivalCity === opt.arrivalCity &&
                (g.airline === opt.airline || g.airline === "Unknown" || opt.airline === "Unknown")
            );

            if (matchIndex >= 0) {
                const group = groups[matchIndex];

                // Data Enrichment: Merge missing information between providers
                if (group.airline === "Unknown" && opt.airline !== "Unknown") {
                    group.airline = opt.airline;
                }
                if (!group.airlineLogo && opt.airlineLogo) {
                    group.airlineLogo = opt.airlineLogo;
                }
                if (!group.flightNumber && opt.flightNumber) {
                    group.flightNumber = opt.flightNumber;
                }

                // If group has name but current opt has logo (and group doesn't), take the logo
                if (group.airline !== "Unknown" && !group.airlineLogo && opt.airlineLogo) {
                    group.airlineLogo = opt.airlineLogo;
                }

                // Update best price for the group
                if (opt.price > 0 && opt.price < group.bestPrice) {
                    group.bestPrice = opt.price;
                }

                const existingOptionIndex = group.options.findIndex(o => o.provider === opt.provider);
                if (existingOptionIndex >= 0) {
                    if (opt.price > 0 && opt.price < group.options[existingOptionIndex].price) {
                        group.options[existingOptionIndex] = {
                            provider: opt.provider,
                            price: opt.price,
                            rawDepartureTime: opt.rawTime,
                            sessionId: opt.sessionId,
                            deepLink: opt.deepLink,
                            badges: opt.badges,
                            stops: opt.stops,
                            duration: opt.duration
                        };
                    }
                } else {
                    group.options.push({
                        provider: opt.provider,
                        price: opt.price,
                        rawDepartureTime: opt.rawTime,
                        sessionId: opt.sessionId,
                        deepLink: opt.deepLink,
                        badges: opt.badges,
                        stops: opt.stops,
                        duration: opt.duration
                    });
                }
            } else {
                // Create new group
                groups.push({
                    id: `${opt.airline}_${opt.departureTime}_${opt.departureCity}_${opt.arrivalCity}`.replace(/\s+/g, '').toUpperCase(),
                    airline: opt.airline,
                    airlineLogo: opt.airlineLogo,
                    flightNumber: opt.flightNumber,
                    departureTime: opt.departureTime,
                    departureCity: opt.departureCity,
                    arrivalTime: opt.arrivalTime,
                    arrivalCity: opt.arrivalCity,
                    duration: opt.duration,
                    stops: opt.stops,
                    options: [{
                        provider: opt.provider,
                        price: opt.price,
                        rawDepartureTime: opt.rawTime,
                        sessionId: opt.sessionId,
                        deepLink: opt.deepLink,
                        badges: opt.badges,
                        stops: opt.stops,
                        duration: opt.duration
                    }],
                    bestPrice: opt.price
                });
            }
        });

        return groups;
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
                                    <div className="w-14 h-14 bg-white rounded-xl p-2 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                        {flight.airlineLogo ? (
                                            <img
                                                src={flight.airlineLogo}
                                                alt={flight.airline}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-gray-400 text-[10px] text-center font-bold leading-tight">${flight.airline}</span>`;
                                                }}
                                            />
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
