import React from "react";
import type {

    ComparisonHotel,
    AgodaHotel,
    OyoHotel,
    BookingHotel,
} from "./Hotels";

interface ComparisonResultsProps {
    comparisonHotels: ComparisonHotel[];
    unmatchedHotels: {
        agoda: AgodaHotel[];
        oyo: OyoHotel[];
        booking: BookingHotel[];
    };
    onBook: (platform: "agoda" | "oyo" | "booking", hotel: any) => void;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({
    comparisonHotels,
    unmatchedHotels,
    onBook,
}) => {
    const [sortBy, setSortBy] = React.useState<"cheapest" | "highest" | "rating" | "comparison">("comparison");

    // Combine all hotels into a single list
    const allDisplayHotels = React.useMemo(() => {
        let list: ComparisonHotel[] = [...comparisonHotels];

        // Helper to format price to number
        const getPriceVal = (priceStr?: string) => {
            if (!priceStr || priceStr === "--") return 999999;
            return parseInt(priceStr.replace(/[^0-9]/g, "")) || 999999;
        };

        // Transform unmatched Agoda
        unmatchedHotels.agoda.forEach((h) => {
            list.push({
                name: h.name,
                agodaPrice: h.price,
                oyoPrice: "--",
                bookingPrice: "--",
                agodaHotel: h,
                oyoHotel: null,
                bookingHotel: null,
                bestPrice: { platform: "agoda", price: h.price },
            });
        });

        // Transform unmatched OYO
        unmatchedHotels.oyo.forEach((h) => {
            list.push({
                name: h.name,
                agodaPrice: "--",
                oyoPrice: `₹ ${h.price}`,
                bookingPrice: "--",
                agodaHotel: null,
                oyoHotel: h,
                bookingHotel: null,
                bestPrice: { platform: "oyo", price: `₹ ${h.price}` },
            });
        });

        // Transform unmatched Booking
        unmatchedHotels.booking.forEach((h) => {
            list.push({
                name: h.name,
                agodaPrice: "--",
                oyoPrice: "--",
                bookingPrice: h.price || "--",
                agodaHotel: null,
                oyoHotel: null,
                bookingHotel: h,
                bestPrice: { platform: "booking", price: h.price || "--" },
            });
        });

        // Sorting Logic
        return list.sort((a, b) => {
            if (sortBy === "comparison") {
                // Count platforms for A
                const platformsA = (a.agodaHotel ? 1 : 0) + (a.oyoHotel ? 1 : 0) + (a.bookingHotel ? 1 : 0);
                // Count platforms for B
                const platformsB = (b.agodaHotel ? 1 : 0) + (b.oyoHotel ? 1 : 0) + (b.bookingHotel ? 1 : 0);

                // If one has more platforms, it comes first
                if (platformsB !== platformsA) {
                    return platformsB - platformsA;
                }
                // If same number of platforms, sort by cheapest price
                const priceA = getPriceVal(a.bestPrice.price);
                const priceB = getPriceVal(b.bestPrice.price);
                return priceA - priceB;
            }

            const priceA = getPriceVal(a.bestPrice.price);
            const priceB = getPriceVal(b.bestPrice.price);

            if (sortBy === "cheapest") {
                return priceA - priceB;
            } else if (sortBy === "highest") {
                return priceB - priceA;
            } else if (sortBy === "rating") {
                // Basic text parsing for rating
                const getRating = (hotel: ComparisonHotel) => {
                    const r1 = parseFloat(hotel.agodaHotel?.rating_score || "0");
                    const r2 = parseFloat(hotel.oyoHotel?.rating || "0");
                    const r3 = parseFloat(hotel.bookingHotel?.rating || "0");
                    return Math.max(r1, r2, r3);
                }
                return getRating(b) - getRating(a);
            }
            return 0;
        });

    }, [comparisonHotels, unmatchedHotels, sortBy]);

    return (
        <div className="w-full max-w-7xl mx-auto font-sans text-white bg-black p-4 rounded-xl min-h-screen">
            {/* Header & Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-[#1a1a1a] rounded-xl p-4 shadow-2xl border border-red-900/30">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        <span>All filters</span>
                    </div>
                    <div className="px-5 py-2.5 border border-red-900/50 rounded-lg text-sm font-semibold text-gray-300 hover:bg-red-900/20 cursor-pointer transition-colors flex items-center gap-2">
                        <span>✨ Smart Filters</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-400">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md bg-[#2a2a2a] font-bold text-white cursor-pointer hover:bg-[#333]"
                        >
                            <option value="comparison">Best Comparison Matches</option>
                            <option value="cheapest">Price: Lowest first</option>
                            <option value="highest">Price: Highest first</option>
                            <option value="rating">Guest Rating</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {allDisplayHotels.map((hotel, index) => {
                    // Determine display image and details
                    const displayImage = hotel.agodaHotel?.image_url || hotel.oyoHotel?.imageurl || hotel.bookingHotel?.image_url || "/images/hotel-placeholder.jpg";
                    const displayName = hotel.agodaHotel?.name || hotel.oyoHotel?.name || hotel.bookingHotel?.name || hotel.name;
                    const displayLocation = hotel.agodaHotel?.location || hotel.oyoHotel?.location || hotel.bookingHotel?.location || "Mumbai";

                    // Rating logic
                    const ratingScore = hotel.agodaHotel?.rating_score || hotel.oyoHotel?.rating || hotel.bookingHotel?.rating || "4.0";
                    const ratingText = hotel.agodaHotel?.rating_text || "Good";

                    // Determine if multiple platforms
                    const platforms: { name: string; price: string; url: string; logo: string }[] = [];
                    // We'll use static logos for now or simple text/colors if images fail
                    if (hotel.agodaPrice !== "--") platforms.push({ name: "agoda", price: hotel.agodaPrice, url: "#", logo: "Agoda" });
                    if (hotel.bookingPrice !== "--") platforms.push({ name: "booking", price: hotel.bookingPrice, url: "#", logo: "Booking.com" });
                    if (hotel.oyoPrice !== "--") platforms.push({ name: "oyo", price: hotel.oyoPrice, url: "#", logo: "OYO" });

                    const isComparison = platforms.length > 1;

                    return (
                        <div key={index} className={`flex flex-col md:flex-row bg-[#151515] rounded-2xl overflow-hidden shadow-lg border ${isComparison ? 'border-red-600/50 shadow-[0_0_10px_rgba(220,38,38,0.15)] scale-[1.01]' : 'border-gray-800'} hover:border-red-600 transition-all duration-300 h-auto md:h-64`}>
                            {/* Left: Image */}
                            <div className="md:w-[320px] relative h-64 md:h-full flex-shrink-0">
                                <img
                                    src={displayImage}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => { e.currentTarget.src = "/images/hotel-placeholder.jpg"; }}
                                />
                                {isComparison && (
                                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg shadow-md z-10">
                                        COMPARED
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <button className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-200 hover:bg-black hover:text-red-500 flex items-center gap-1 shadow-sm border border-gray-700 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Middle: Details */}
                            <div className="flex-1 p-5 flex flex-col h-full border-r border-gray-800 overflow-y-auto custom-scrollbar">
                                <div className="mb-2">
                                    <h3 className="text-xl font-bold text-white leading-tight hover:text-red-500 transition-colors cursor-pointer line-clamp-2">{displayName}</h3>
                                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1 line-clamp-1">
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {displayLocation}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded shadow-sm">
                                        {ratingScore}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-300 leading-none">{ratingText}</span>
                                    </div>
                                    <div className="flex text-yellow-500 text-xs ml-1">
                                        {"★".repeat(Math.floor(parseFloat(ratingScore) / 2))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    {platforms.length > 1 && (
                                        <span className="bg-red-900/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800/50 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            {platforms.length} Platforms Compared
                                        </span>
                                    )}
                                </div>

                                {/* Providers List (Compacted) */}
                                <div className="mt-auto pt-2 border-t border-gray-800">
                                    <div className="space-y-1">
                                        {platforms.map((p, i) => {
                                            const isBest = p.name === hotel.bestPrice.platform;
                                            return (
                                                <div key={i} className={`flex justify-between items-center text-xs py-2 px-3 rounded cursor-pointer transition-colors ${isBest ? 'bg-red-900/20 border border-red-900/50' : 'hover:bg-gray-800'}`}
                                                    onClick={() => {
                                                        const h = hotel.bestPrice.platform === "agoda" ? hotel.agodaHotel : hotel.bestPrice.platform === "oyo" ? hotel.oyoHotel : hotel.bookingHotel;
                                                        onBook(p.name as any, h);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${p.name === 'agoda' ? 'bg-[#333]' : p.name === 'booking' ? 'bg-[#003580]' : 'bg-[#ee2e24]'
                                                            }`}>
                                                            {p.name[0].toUpperCase()}
                                                        </div>
                                                        <span className={`font-medium capitalize truncate w-16 ${isBest ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
                                                    </div>
                                                    <span className={`font-bold ${isBest ? 'text-red-400 text-sm' : 'text-gray-400'}`}>
                                                        {p.price}
                                                        {isBest && <span className="ml-2 text-[9px] text-red-500 animate-pulse">CHEAPEST</span>}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Pricing & CTA */}
                            <div className="md:w-[220px] p-5 flex flex-col justify-center items-end bg-[#111] border-l border-gray-800 flex-shrink-0 relative">
                                {isComparison && (
                                    <div className="absolute top-0 right-0 left-0 bg-red-600/10 border-b border-red-600/30 text-center py-1">
                                        <p className="text-[9px] font-bold text-red-400 tracking-widest uppercase">Best Price Found</p>
                                    </div>
                                )}

                                <div className="text-right w-full mt-4">
                                    <div className="flex justify-end mb-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{hotel.bestPrice.platform}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white leading-none">
                                        {hotel.bestPrice.price}
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 font-medium text-right mb-4">+ taxes & fees</p>

                                    <button
                                        onClick={() => {
                                            const bestP = platforms.find(p => p.name === hotel.bestPrice.platform);
                                            if (bestP) {
                                                const h = hotel.bestPrice.platform === "agoda" ? hotel.agodaHotel : hotel.bestPrice.platform === "oyo" ? hotel.oyoHotel : hotel.bookingHotel;
                                                onBook(hotel.bestPrice.platform, h);
                                            }
                                        }}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-900/30 transition-all hover:shadow-red-600/40 active:scale-95 flex items-center justify-center gap-2 text-md"
                                    >
                                        View Deal
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>

                                    <div className="text-center mt-3">
                                        <span className="text-[10px] font-medium text-green-400">
                                            Free cancellation
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="text-center pt-8 pb-12">
                <p className="text-sm text-gray-500 font-medium tracking-wide">
                    Showing {allDisplayHotels.length} properties
                </p>
            </div>
        </div>
    );
};

export default ComparisonResults;
