import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface SearchParams {
  destination: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  rooms: number;
}

interface BookingParams {
  property_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

interface Hotel {
  name: string;
  location: string;
  rating: number;
  price: string;
  original_price?: string;
  discount?: string;
  image_url: string;
  property_url: string;
  review_score: number;
  review_count: number;
  facilities: string[];
}

export default function BookingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(true);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");

  const [searchParams, setSearchParams] = useState<SearchParams>({
    destination: "",
    checkin_date: "",
    checkout_date: "",
    adults: 1,
    children: 0,
    rooms: 1,
  });

  const [bookingParams, setBookingParams] = useState<BookingParams>({
    property_url: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [pendingHotel, setPendingHotel] = useState<Hotel | null>(null);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const pushSystem = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", content: text },
    ]);

  const pushUser = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);

  const handleLogin = async () => {
    console.log("STEP 01: Login workflow started");
    console.log("STEP 01.1: Email:", email);

    if (!email.trim() || !email.includes("@")) {
      console.log("STEP 01.2: Invalid email");
      alert("Please enter a valid email address");
      return;
    }

    setLoadingLogin(true);
    console.log("STEP 01.3: Login API request sending...");

    try {
      const res = await fetch(`/api/booking/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("STEP 01.4: Login API response:", data);

      if (data.session_id) {
        console.log(
          "STEP 01.5: Login successful, Session ID:",
          data.session_id
        );
        setSessionId(data.session_id);
        setShowLoginPopup(false);
        setShowOtpPopup(true);
        pushSystem(`OTP sent to ${email}. Please check your email.`);
      } else {
        console.log("STEP 01.6: Login failed");
        alert("Login failed. Please try again.");
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingLogin(false);
  };

  const handleOtpSubmit = async () => {
    console.log("STEP 02: OTP workflow started");
    console.log("STEP 02.1: OTP entered:", otp);

    if (!otp.trim()) {
      console.log("STEP 02.2: Invalid OTP");
      alert("Please enter the OTP");
      return;
    }

    setLoadingOtp(true);
    console.log("STEP 02.3: OTP API request sending...");

    try {
      const res = await fetch(`/api/booking/submit-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      const data = await res.json();
      console.log("STEP 02.4: OTP API response:", data);

      if (data.status === "success" || data.success) {
        console.log("STEP 02.5: OTP verification successful");
        setShowOtpPopup(false);
        pushSystem("✅ Login successful!");
      } else {
        console.log("STEP 02.6: OTP verification failed");
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.log("STEP 02: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleSearch = async () => {
    console.log("STEP 03: Search triggered with params:", searchParams);

    if (!searchParams.destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    const checkinDate = searchParams.checkin_date
      ? new Date(searchParams.checkin_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const checkoutDate = searchParams.checkout_date
      ? new Date(searchParams.checkout_date).toISOString().split("T")[0]
      : new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

    setLoadingSearch(true);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/booking/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          destination: searchParams.destination,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          adults: searchParams.adults,
          children: searchParams.children,
          rooms: searchParams.rooms,
        }),
      });

      const data = await response.json();
      console.log("STEP 03.2: Search API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 03.3: Session ID updated to:", data.session_id);
      }

      const hotels = data.hotels || data.results || [];
      console.log("STEP 03.4: Extracted hotels =", hotels);

      if (hotels.length > 0) {
        pushSystem(
          JSON.stringify({
            type: "hotel_list",
            hotels: hotels,
            searchParams: {
              destination: searchParams.destination,
              checkin_date: checkinDate,
              checkout_date: checkoutDate,
            },
          })
        );
      } else {
        pushSystem(
          "🔍 No hotels found for your search criteria. Please try different dates or destination."
        );
      }
    } catch (err) {
      console.log("STEP 03: Error:", err);
      pushSystem("❌ Something went wrong while searching for hotels!");
    } finally {
      setShowSearchPopup(false);
      setLoadingSearch(false);
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    console.log("STEP 04: Booking triggered for hotel:", pendingHotel);

    if (!pendingHotel) {
      pushSystem("Please select a hotel first.");
      return;
    }

    if (
      !bookingParams.first_name ||
      !bookingParams.last_name ||
      !bookingParams.email ||
      !bookingParams.phone_number
    ) {
      alert("Please fill all booking details");
      return;
    }

    setLoadingBooking(true);

    try {
      const res = await fetch(`/api/booking/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          property_url: pendingHotel.property_url,
          ...bookingParams,
        }),
      });

      const data = await res.json();
      console.log("STEP 04.1: Booking API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 04.2: Session ID updated to:", data.session_id);
      }

      if (data.status === "success" || data.booking_id) {
        pushSystem(
          JSON.stringify({
            type: "booking_success",
            booking_id:
              data.booking_id ||
              "BK" + Math.random().toString(36).substr(2, 8).toUpperCase(),
            hotel_name: pendingHotel.name,
            checkin_date: searchParams.checkin_date,
            checkout_date: searchParams.checkout_date,
            guest_name: `${bookingParams.first_name} ${bookingParams.last_name}`,
          })
        );
        setShowBookingPopup(false);
        setPendingHotel(null);
      } else {
        pushSystem("❌ Failed to complete booking. Please try again.");
      }
    } catch (err) {
      console.log("STEP 04: Error:", err);
      pushSystem("❌ Failed to complete booking!");
    }

    setLoadingBooking(false);
  };

  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "hotel_list") {
      content = (
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">
                🏨 Hotels in {parsed.searchParams?.destination}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {parsed.searchParams?.checkin_date}
                </div>
                <div className="flex items-center gap-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {parsed.searchParams?.checkout_date}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parsed.hotels?.slice(0, 6).map((hotel: Hotel, index: number) => {
                const key = hotel.name + hotel.location + hotel.price + index;
                const isSelected =
                  pendingHotel?.property_url === hotel.property_url;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setPendingHotel(hotel);
                      setBookingParams((prev) => ({
                        ...prev,
                        email: email,
                        property_url: hotel.property_url,
                      }));
                      setShowBookingPopup(true);
                    }}
                    className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-red-500 bg-[#1e1416]"
                        : "hover:bg-[#151622] hover:shadow-lg"
                    }`}
                  >
                    {hotel.image_url && (
                      <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900">
                        <img
                          src={hotel.image_url}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full text-xs">
                          <span className="text-yellow-300">⭐</span>
                          <span className="text-white font-medium">
                            {hotel.rating || hotel.review_score || "4.0"}
                          </span>
                        </div>
                        {hotel.discount && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                            {hotel.discount}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1 flex flex-col p-4 gap-3">
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white line-clamp-1">
                          {hotel.name}
                        </h4>
                        <p className="text-sm text-gray-300 flex items-center gap-1">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="line-clamp-1">{hotel.location}</span>
                        </p>
                      </div>

                      {hotel.review_score > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-red-900/40 px-2 py-1 rounded">
                            <span className="text-yellow-300 font-bold">
                              {hotel.review_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-300">/10</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {hotel.review_count} reviews
                          </span>
                        </div>
                      )}

                      {hotel.facilities && hotel.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hotel.facilities.slice(0, 2).map((facility, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-800/60 rounded text-gray-300"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-white">
                            {hotel.price}
                          </p>
                          {hotel.original_price &&
                            hotel.original_price !== hotel.price && (
                              <p className="text-sm text-gray-400 line-through">
                                {hotel.original_price}
                              </p>
                            )}
                        </div>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else if (
      typeof parsed === "object" &&
      parsed?.type === "booking_success"
    ) {
      content = (
        <div className="p-5 bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-600/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-bold text-green-400 text-xl">
                  🎉 Booking Confirmed!
                </p>
                <p className="text-sm text-green-300 mt-1">
                  Your stay at{" "}
                  <span className="font-semibold text-white">
                    {parsed.hotel_name}
                  </span>{" "}
                  has been confirmed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-black/30 rounded-xl">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Booking ID</p>
                  <p className="font-mono font-bold text-white">
                    {parsed.booking_id}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Guest Name</p>
                  <p className="font-semibold text-white">
                    {parsed.guest_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Check-in</p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-semibold text-white">
                      {parsed.checkin_date}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Check-out</p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-semibold text-white">
                      {parsed.checkout_date}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-green-400/80 pt-2 border-t border-green-500/20">
                📧 Confirmation email has been sent to {email}
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      const renderFormatted = (text: string) => {
        return text.split("\n").map((line, i) => (
          <p
            key={i}
            className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
            dangerouslySetInnerHTML={{
              __html: line
                .replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong class='text-white'>$1</strong>"
                )
                .replace(
                  /([🏨📍⭐💳📅👥👶🛏️✅📧📱🎉🔍❌])/g,
                  '<span class="inline-block mr-1">$1</span>'
                ),
            }}
          />
        ));
      };

      content = (
        <div className="space-y-2">{renderFormatted(String(parsed))}</div>
      );
    }

    return typeof parsed === "object" && parsed?.type === "hotel_list" ? (
      <div key={m.id} className="w-full">
        {content}
      </div>
    ) : (
      <div
        key={m.id}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`${
            m.role === "user"
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-700"
              : "bg-gray-900/80 text-gray-100 border-gray-800"
          } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-5 py-4 border shadow-sm`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS */}

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                <img src="/logo/BookingCom.png" alt="Booking.com" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Booking.com
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Enter your email to continue
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loadingLogin}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingLogin ? <PopupLoader /> : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP POPUP */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
              <p className="text-gray-400 text-sm mt-2">
                Enter the OTP sent to {email}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none text-center text-2xl tracking-widest font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  May contain letters and numbers
                </p>
              </div>

              <button
                onClick={handleOtpSubmit}
                disabled={loadingOtp || otp.length < 4}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingOtp ? <PopupLoader /> : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH POPUP */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-6 rounded-3xl w-full max-w-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Find Your Stay
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Search hotels worldwide
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSearchPopup(false)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="City, region, or hotel name"
                    value={searchParams.destination}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Check-in Date */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkin_date}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        checkin_date: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkout_date}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        checkout_date: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Guests & Rooms */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0H21m-4.5 0H15m4.5 0h.008v.008h-.008V15zm0 0h.008v.008h-.008V15z"
                      />
                    </svg>
                    Guests & Rooms
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Adults</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={searchParams.adults}
                        onChange={(e) =>
                          setSearchParams((prev) => ({
                            ...prev,
                            adults: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-gray-700 text-white outline-none text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Children</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={searchParams.children}
                        onChange={(e) =>
                          setSearchParams((prev) => ({
                            ...prev,
                            children: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-gray-700 text-white outline-none text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Rooms</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={searchParams.rooms}
                        onChange={(e) =>
                          setSearchParams((prev) => ({
                            ...prev,
                            rooms: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-gray-700 text-white outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loadingSearch || !searchParams.destination}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20 mt-4"
              >
                {loadingSearch ? (
                  <PopupLoader />
                ) : (
                  <>
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search Hotels
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING POPUP */}
      {showBookingPopup && pendingHotel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-6 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Complete Booking
                    </h2>
                    <p className="text-gray-400 text-sm">Enter your details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingPopup(false)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
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
              </div>

              {/* Hotel Summary */}
              <div className="bg-gray-800/50 p-4 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  {pendingHotel.image_url && (
                    <img
                      src={pendingHotel.image_url}
                      alt={pendingHotel.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white line-clamp-1">
                      {pendingHotel.name}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-1">
                      {pendingHotel.location}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-white">
                        {pendingHotel.price}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>
                          ⭐{" "}
                          {pendingHotel.rating ||
                            pendingHotel.review_score?.toFixed(1) ||
                            "4.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Details Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={bookingParams.first_name}
                      onChange={(e) =>
                        setBookingParams((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={bookingParams.last_name}
                      onChange={(e) =>
                        setBookingParams((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={bookingParams.email}
                    onChange={(e) =>
                      setBookingParams((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={bookingParams.phone_number}
                    onChange={(e) =>
                      setBookingParams((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={
                  loadingBooking ||
                  !bookingParams.first_name ||
                  !bookingParams.last_name ||
                  !bookingParams.email ||
                  !bookingParams.phone_number
                }
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-green-500/20"
              >
                {loadingBooking ? (
                  <PopupLoader />
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* CONDITIONAL RENDERING FOR CHAT VS LANDING PAGE */}
      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 w-64 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center gap-2 px-4 py-3">
              <button
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <img
                  src="/images/LOGO.png"
                  alt="Booking AI"
                  className="h-12 w-auto sm:h-14 md:h-16 shrink-0 object-contain"
                />
              </button>
              <button
                aria-label="Toggle sidebar"
                className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
                onClick={() => setSidebarOpen((v) => !v)}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </aside>

          {/* Chat Messages */}
          <div className="ml-0 md:ml-64 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
            {isLoading && <FlowerLoader />}
          </div>

        </div>
      ) : (
        <div className="min-h-screen w-screen bg-black text-white">
          {/* Sidebar */}
          <aside
            className={`fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 w-64 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center gap-2 px-4 py-3">
              <button
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <img
                  src="/images/LOGO.png"
                  alt="Booking AI"
                  className="h-12 w-auto sm:h-14 md:h-16 shrink-0 object-contain"
                />
              </button>
              <button
                aria-label="Toggle sidebar"
                className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
                onClick={() => setSidebarOpen((v) => !v)}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col relative">
            {/* Top bar */}
            <div className="sticky top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
              {!sidebarOpen && (
                <button
                  aria-label="Open sidebar"
                  className="absolute left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <img
                    src="/images/Circle.png"
                    alt="Open sidebar"
                    className="h-8 w-8 object-contain"
                  />
                </button>
              )}
              <div className="ml-auto flex items-center gap-3">
                <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <div className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    L
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="/images/LOGO.png"
                    alt="Booking AI"
                    className="h-20"
                  />
                </div>

                {/* Greeting */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-semibold">
                    Welcome to Booking.com AI Assistant
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg">
                    Find and book your perfect stay effortlessly
                  </p>
                </div>

                {/* Search Button */}
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => {
                      setShowChat(true);
                      setShowSearchPopup(true);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 flex items-center gap-3"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Start Hotel Search
                  </button>
                </div>


              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
