import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

export default function Agoda() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"search" | "listings">("search");

  const [location, setLocation] = useState("");
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        destination: location,
        check_in: dates.checkIn,
        check_out: dates.checkOut,
        rooms: guests.rooms,
        adults: guests.adults,
        children: guests.children,
        max_items: 3,
      };

      const res = await fetch(`${BaseURL}/api/agoda/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      const data = Array.isArray(json?.results) ? json.results : [];
      setResults(data);
      setStep("listings");
    } catch (e) {
      setError("Failed to fetch Agoda hotels.");
    } finally {
      setLoading(false);
    }
  };

  const updateGuests = (
    type: "adults" | "children" | "rooms",
    delta: number,
  ) => {
    setGuests((prev) => {
      const newVal = prev[type] + delta;
      if (newVal < 0) return prev;
      if (type === "rooms" && newVal < 1) return prev;
      if (type === "adults" && newVal < 1) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <header className="flex justify-between items-center py-4 px-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            khwaa<span className="text-red-500">*</span>sh
          </h1>
          <span className="text-[10px] bg-gray-800 text-gray-400 px-1 rounded border border-gray-700">
            AI
          </span>
          <svg
            className="w-5 h-5 text-gray-400 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600">
            <img
              src="/images/user.jpg"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {step === "search" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-gray-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => navigate("/home")}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-center mb-6">Booking Details</h2>

            <div className="space-y-4">
              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-[#111] px-1 text-xs text-gray-500 group-focus-within:text-white transition-colors">
                  Enter location
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g : Hyderabad"
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-600"
                  />
                  <button className="ml-2 p-3 border border-gray-700 rounded-lg hover:bg-gray-900 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-3 bg-[#111] px-1 text-xs text-gray-500 group-focus-within:text-white transition-colors">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={dates.checkIn}
                    onChange={(e) =>
                      setDates({ ...dates, checkIn: e.target.value })
                    }
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-600 [color-scheme:dark]"
                  />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-3 bg-[#111] px-1 text-xs text-gray-500 group-focus-within:text-white transition-colors">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={dates.checkOut}
                    onChange={(e) =>
                      setDates({ ...dates, checkOut: e.target.value })
                    }
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-gray-600 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-[#111] px-1 text-xs text-gray-500 transition-colors">
                  Number of people
                </label>
                <button
                  onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  className="w-full flex justify-between items-center bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none hover:border-gray-500 text-left"
                >
                  <span>
                    {guests.adults} adults . {guests.children} children .{" "}
                    {guests.rooms} room
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showGuestDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showGuestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 z-20 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adults</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("adults", -1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {guests.adults}
                        </span>
                        <button
                          onClick={() => updateGuests("adults", 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Children</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("children", -1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {guests.children}
                        </span>
                        <button
                          onClick={() => updateGuests("children", 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rooms</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("rooms", -1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {guests.rooms}
                        </span>
                        <button
                          onClick={() => updateGuests("rooms", 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded hover:bg-gray-800 text-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={loading}
                className={`w-full bg-[#D4111D] text-white font-semibold py-3 rounded-xl transition-colors mt-4 shadow-[0_0_20px_rgba(212,17,29,0.4)] ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#b00e18]"
                  }`}
              >
                {loading ? "Searching..." : "CONTINUE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "listings" && (
        <div className="max-w-4xl mx-auto pt-8 pb-32">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <button
                onClick={() => setStep("search")}
                className="text-sm text-gray-400 hover:text-white mb-2 flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
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
                Change search
              </button>
              <h2 className="text-2xl font-semibold">Book your stay</h2>
            </div>
            <button className="bg-[#111] border border-gray-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-gray-900">
              Sort
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-1 mb-6 text-sm text-gray-400">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <span className="text-red-500 text-base">★</span> Executing your
              Khwaaish....
            </div>
            <p>
              Please Provide the Location and other details for the booking to
              proceed.
            </p>
            <div className="flex gap-4 pt-1">
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Booking location & details confirmed
                <span className="text-blue-500 cursor-pointer underline ml-1">
                  Check
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Rooms found
            </div>
          </div>
          {loading && (
            <p className="text-sm text-gray-400">Loading hotels...</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && results.length === 0 && (
            <p className="text-sm text-gray-400">No hotels found yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((hotel, index) => {
              const imageSrc = hotel.image_url
                ? hotel.image_url.startsWith("//")
                  ? `https:${hotel.image_url}`
                  : hotel.image_url
                : "/placeholder.jpg";
              return (
                <div
                  key={index}
                  className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={imageSrc}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      View
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-semibold">{hotel.name}</h3>
                      <p className="text-gray-500 text-sm">{hotel.area}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          {hotel.original_price && (
                            <span className="text-xs line-through text-red-500">
                              {hotel.original_price}
                            </span>
                          )}
                          {hotel.price && (
                            <span className="text-xl font-bold">{hotel.price}</span>
                          )}
                        </div>
                        {hotel.rating && (
                          <p className="text-xs text-gray-400 mt-1">
                            Rating: {hotel.rating}
                          </p>
                        )}
                      </div>

                      <button
                        className="bg-[#D4111D] hover:bg-[#b00e18] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-red-900/20"
                        onClick={() => {
                          if (hotel.url) {
                            window.open(hotel.url, "_blank");
                          }
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="What is your Khwaaish?"
                className="w-full bg-[#1c1c1c]/90 backdrop-blur-md border border-gray-700 rounded-full pl-6 pr-32 py-4 text-sm focus:outline-none focus:border-gray-500 shadow-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
