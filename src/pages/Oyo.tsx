import React, { useState, useEffect } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const BaseURL = import.meta.env.VITE_API_BASE_URL;

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface Hotel {
  hotel_id: string;
  name: string;
  location: string;
  imageurl: string;
  price: string;
  facilities: Array<Record<string, string>>;
  rating: string;
  hotel_url: string;
  booking_url: string;
  raw: any;
}

interface BookingDetails {
  name: string;
  email: string;
  phone_number: string;
  pay_mode: string;
  upi_id: string;
}

interface SearchParams {
  city: string;
  state: string;
  country: string;
  city_id: number;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  adults_in_room: number;
}

export default function Oyo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    name: "",
    email: "",
    phone_number: "",
    pay_mode: "upi",
    upi_id: "",
  });

  const [searchParams, setSearchParams] = useState<SearchParams>({
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    city_id: 5,
    checkin: "",
    checkout: "",
    guests: 1,
    rooms: 1,
    adults_in_room: 1,
  });

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [pendingHotel, setPendingHotel] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    console.log("STEP 01.1: Phone:", phone);

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingLogin(true);

    try {
      const res = await fetch(`${BaseURL}/api/oyo_automation/oyo/login/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
        }),
      });

      const data = await res.json();
      console.log("STEP 01.2: Login API response:", data);

      if (data.status === "otp_sent") {
        console.log("STEP 01.3: OTP sent successfully");
        setShowLoginPopup(false);
        setShowOtpPopup(true);
        pushSystem(
          "OTP has been sent to your phone number. Please enter it to continue."
        );
      } else {
        console.log("STEP 01.4: Login failed");
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
      console.log("STEP 02.2: Missing OTP");
      return;
    }

    setLoadingOtp(true);

    try {
      const res = await fetch(
        `${BaseURL}/api/oyo_automation/oyo/login/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone,
            otp: otp,
          }),
        }
      );

      const data = await res.json();
      console.log("STEP 02.3: OTP API response:", data);

      if (data.status === "success") {
        console.log("STEP 02.4: OTP verification successful");
        setShowOtpPopup(false);
        setIsLoggedIn(true);
        pushSystem(
          "Login successful! 🎉 You can now search for hotels. Please provide your travel details."
        );

        // Show search popup after successful login
        setTimeout(() => {
          setShowSearchPopup(true);
        }, 500);
      } else {
        console.log("STEP 02.5: OTP verification failed");
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

    // Validate dates
    if (!searchParams.checkin || !searchParams.checkout) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (searchParams.checkin >= searchParams.checkout) {
      alert("Check-out date must be after check-in date");
      return;
    }

    setLoadingSearch(true);
    setShowSearchPopup(false);
    pushSystem(
      `Searching for hotels in ${searchParams.city} from ${searchParams.checkin} to ${searchParams.checkout}...`
    );

    try {
      const res = await fetch(`${BaseURL}/api/oyo_automation/oyo/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });

      const data = await res.json();
      console.log("STEP 03.1: Search API response:", data);

      if (data.status === "ok" && data.hotels && data.hotels.length > 0) {
        console.log("STEP 03.2: Found", data.hotels.length, "hotels");
        setHotels(data.hotels);

        pushSystem(
          JSON.stringify({
            type: "hotel_list",
            hotels: data.hotels,
            searchParams: searchParams,
          })
        );
      } else {
        console.log("STEP 03.3: No hotels found");
        pushSystem(
          "No hotels found for your search criteria. Please try different dates or location."
        );
      }
    } catch (err) {
      console.log("STEP 03: Error:", err);
      pushSystem("Something went wrong while searching for hotels! " + err);
    }

    setLoadingSearch(false);
  };

  const handleHotelSelect = async (hotel: Hotel) => {
    console.log("Hotel selected:", hotel);
    setPendingHotel(hotel);

    pushSystem(
      `Selected ${hotel.name} for ₹${hotel.price}/night. Would you like to book this hotel?`
    );

    // Show booking popup
    setTimeout(() => {
      setShowBookingPopup(true);
    }, 500);
  };

  const handleBookingSubmit = async () => {
    if (loadingBooking) return;

    console.log("STEP 04: Booking workflow started");

    // Validate booking details
    if (
      !bookingDetails.name ||
      !bookingDetails.email ||
      !bookingDetails.phone_number
    ) {
      alert("Please fill all required booking details");
      return;
    }

    if (!pendingHotel) {
      pushSystem("No hotel selected. Please select a hotel first.");
      return;
    }

    setLoadingBooking(true);
    setShowBookingPopup(false);

    try {
      const res = await fetch(`${BaseURL}/api/oyo_automation/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: bookingDetails.phone_number,
          hotel_url: pendingHotel.booking_url,
          name: bookingDetails.name,
          email: bookingDetails.email,
          pay_mode: bookingDetails.pay_mode,
          upi_id: bookingDetails.upi_id,
          headless: true,
        }),
      });

      const data = await res.json();
      console.log("STEP 04.1: Booking API response:", data);

      if (data.status === "success" || data.message?.includes("success")) {
        console.log("STEP 04.2: Booking successful");
        setShowUpiPopup(true);
        pushSystem("Hotel booking successful! Please complete the payment.");
      } else {
        console.log("STEP 04.3: Booking failed");
        pushSystem("Failed to book hotel. Please try again.");
      }
    } catch (err) {
      console.log("STEP 04: Error:", err);
      pushSystem("Failed to book hotel!");
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (loadingPayment) return;

    console.log("STEP 05: UPI payment workflow started");

    if (!upiId.trim()) {
      alert("Please enter your UPI ID");
      return;
    }

    setLoadingPayment(true);

    try {
      // Update booking with UPI ID
      const res = await fetch(`${BaseURL}/api/oyo_automation/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: bookingDetails.phone_number,
          hotel_url: pendingHotel?.booking_url,
          name: bookingDetails.name,
          email: bookingDetails.email,
          pay_mode: "upi",
          upi_id: upiId,
          headless: true,
        }),
      });

      const data = await res.json();
      console.log("STEP 05.1: Payment API response:", data);

      if (data.status === "success" || data.message?.includes("success")) {
        console.log("STEP 05.2: Payment successful");
        setShowUpiPopup(false);
        pushSystem(
          JSON.stringify({
            type: "booking_success",
            message: `Payment successful! Your booking at ${
              pendingHotel?.name
            } has been confirmed. Booking ID: ${data.booking_id || "N/A"}`,
          })
        );
      } else {
        console.log("STEP 05.3: Payment failed");
        pushSystem("Payment failed. Please try again.");
      }
    } catch (err) {
      console.log("STEP 05: Error:", err);
      pushSystem("Payment failed!");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim()) {
      console.log("Empty message, stopping.");
      return;
    }

    setShowChat(true);
    const userText = messageInput;
    pushUser(userText);
    setMessageInput("");

    // Check if user is asking to search hotels
    const lowerText = userText.toLowerCase();
    if (
      lowerText.includes("hotel") ||
      lowerText.includes("oyo") ||
      lowerText.includes("book") ||
      lowerText.includes("stay")
    ) {
      if (!isLoggedIn) {
        pushSystem("Please login first to search for hotels.");
        setShowLoginPopup(true);
      } else {
        pushSystem("Please provide your travel details to search for hotels.");
        setShowSearchPopup(true);
      }
    } else {
      pushSystem(
        "I can help you book OYO hotels. Please tell me your travel requirements or login to continue."
      );
    }
  };

  const formatFacilities = (facilities: Array<Record<string, string>>) => {
    const uniqueFacilities = new Set<string>();
    facilities.forEach((facility) => {
      Object.values(facility).forEach((value) => {
        if (value && value.trim()) {
          uniqueFacilities.add(value);
        }
      });
    });
    return Array.from(uniqueFacilities).slice(0, 5);
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">
            Found {parsed.hotels?.length || 0} hotels in{" "}
            {parsed.searchParams?.city}:
          </h3>

          <div className="max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsed.hotels
                ?.slice(0, 10)
                .map((hotel: Hotel, index: number) => {
                  const key = hotel.hotel_id + index;
                  const isSelected =
                    pendingHotel && pendingHotel.hotel_id === hotel.hotel_id;
                  const facilities = formatFacilities(hotel.facilities || []);

                  return (
                    <div
                      key={key}
                      onClick={() => handleHotelSelect(hotel)}
                      className={`bg-[#11121a] rounded-2xl overflow-hidden border border-gray-800 cursor-pointer transition-all hover:border-[#FF5A5F]/50 ${
                        isSelected ? "border-[#FF5A5F] bg-[#FF5A5F]/10" : ""
                      }`}
                    >
                      {hotel.imageurl && (
                        <div className="relative h-48 sm:h-56 md:h-64">
                          <img
                            src={hotel.imageurl}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement?.classList.add(
                                "bg-gray-800"
                              );
                            }}
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                            <span className="text-yellow-300">⭐</span>
                            <span className="text-white font-medium">4.1</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        <div>
                          <h2 className="text-xl font-bold text-white line-clamp-1">
                            {hotel.name}
                          </h2>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {hotel.location}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-white">
                              ₹{hotel.price}
                            </p>
                            <p className="text-sm text-gray-400">/night</p>
                          </div>
                          {facilities.length > 0 && (
                            <div className="text-xs px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/40">
                              {facilities.length} amenities
                            </div>
                          )}
                        </div>

                        {facilities.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-300 line-clamp-1">
                              {facilities.join(" • ")}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHotelSelect(hotel);
                          }}
                          className="w-full py-3 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-[#FF5A5F]/25"
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Book Now
                        </button>
                      </div>
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
        <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
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
          <div className="flex-1">
            <p className="font-semibold text-green-400 mb-2">
              Booking Confirmed! 🎉
            </p>
            {typeof parsed === "object" && parsed.message && (
              <div className="text-sm text-green-300 space-y-1 whitespace-pre-line">
                {parsed.message
                  .split("\n")
                  .map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      const renderFormatted = (text: string) => {
        return text.split("\n").map((line, i) => {
          let formatted = line;
          formatted = formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          );
          formatted = formatted.replace(
            /([🛍️📋🎯💡📝💬❌🔍💰📦])/g,
            '<span class="text-xl">$1</span>'
          );

          return (
            <p
              key={i}
              className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        });
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
              ? "bg-white/15 text-white border-white/20"
              : "bg-gray-900/80 text-gray-100 border-gray-800"
          } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
        >
          {content}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    if (!searchParams.checkin) {
      setSearchParams((prev) => ({
        ...prev,
        checkin: formatDate(today),
        checkout: formatDate(tomorrow),
      }));
    }
  }, []);

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Login to OYO
                </h2>
                <p className="text-sm text-gray-400">
                  Enter your phone number to continue
                </p>
              </div>
            </div>

            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                disabled={loadingLogin || phone.length < 10}
                className="flex-1 py-2 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingLogin ? <PopupLoader /> : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP POPUP */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
            <p className="text-sm text-gray-400">
              OTP sent to +91 •••• ••{phone.slice(-2)}
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none text-center text-lg tracking-widest"
              maxLength={6}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowOtpPopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Back
              </button>
              <button
                onClick={handleOtpSubmit}
                disabled={loadingOtp || otp.length !== 6}
                className="flex-1 py-2 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingOtp ? <PopupLoader /> : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH POPUP */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 md:w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Hotel Search Details
            </h2>
            <p className="text-sm text-gray-400">
              Please provide your travel details
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">City</label>
                <input
                  type="text"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={searchParams.city}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, city: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkin}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        checkin: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkout}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        checkout: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                    min={
                      searchParams.checkin ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Guests
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...searchParams,
                          guests: Math.max(1, searchParams.guests - 1),
                        })
                      }
                      className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <span className="text-xl">-</span>
                    </button>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {searchParams.guests}
                      </div>
                      <div className="text-xs text-gray-400">Guests</div>
                    </div>
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...searchParams,
                          guests: searchParams.guests + 1,
                        })
                      }
                      className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Rooms
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...searchParams,
                          rooms: Math.max(1, searchParams.rooms - 1),
                        })
                      }
                      className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <span className="text-xl">-</span>
                    </button>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {searchParams.rooms}
                      </div>
                      <div className="text-xs text-gray-400">Rooms</div>
                    </div>
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...searchParams,
                          rooms: searchParams.rooms + 1,
                        })
                      }
                      className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSearchPopup(false);
                  pushSystem("Search cancelled.");
                }}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                disabled={
                  loadingSearch ||
                  !searchParams.checkin ||
                  !searchParams.checkout
                }
                className="flex-1 py-2 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingSearch ? <PopupLoader /> : "Search Hotels"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING POPUP */}
      {showBookingPopup && pendingHotel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 md:w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Complete Your Booking
            </h2>
            <p className="text-sm text-gray-400">{pendingHotel.name}</p>

            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <p className="text-sm font-semibold text-white">
                {pendingHotel.name}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {pendingHotel.location}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-bold text-[#FF5A5F]">
                  ₹{pendingHotel.price}/night
                </p>
                <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                  <span className="text-yellow-300">⭐</span>
                  <span className="text-white font-medium">4.1</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={bookingDetails.name}
                onChange={(e) =>
                  setBookingDetails({ ...bookingDetails, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={bookingDetails.email}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={bookingDetails.phone_number}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    phone_number: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowBookingPopup(false);
                  pushSystem("Booking cancelled.");
                }}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={
                  loadingBooking ||
                  !bookingDetails.name ||
                  !bookingDetails.email ||
                  !bookingDetails.phone_number
                }
                className="flex-1 py-2 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingBooking ? <PopupLoader /> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Complete Payment
            </h2>
            <p className="text-sm text-gray-400">
              Enter your UPI ID to pay ₹{pendingHotel?.price}
            </p>

            <input
              type="text"
              placeholder="UPI ID (e.g., name@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpiPopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpiSubmit}
                disabled={loadingPayment || !upiId.trim()}
                className="flex-1 py-2 bg-[#FF5A5F] hover:bg-[#FF4A50] rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingPayment ? <PopupLoader /> : "Pay Now"}
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
          {/* Chat Messages */}
          <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
            {loadingSearch && <FlowerLoader />}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 
                     bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Search for OYO hotels or ask about bookings..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? `${prev} ${text}` : text))
                }
              />

              <button
                type="submit"
                disabled={loadingSearch}
                className={`p-2.5 rounded-full ${
                  loadingSearch ? "opacity-50" : ""
                } ${
                  messageInput
                    ? "bg-[#FF5A5F] hover:bg-[#FF4A50]"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {loadingSearch ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
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
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="min-h-screen w-screen bg-black text-white">
          {/* Sidebar - always visible */}
          <aside
            className={
              `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
              `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            }
          >
            {/* Logo and collapse */}
            <div className="flex justify-between items-center gap-2 px-4 py-3">
              <button
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <img
                  src="/images/LOGO.png"
                  alt="Khwaaish AI"
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

            {/* New Chat */}
            <div className="px-3">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                onClick={() => {
                  setShowChat(true);
                  setMessages([]);
                  setMessageInput("");
                }}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New chat</span>
              </button>
            </div>

            {/* Sections */}
            <div className="mt-3 space-y-2 px-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>History</span>
              </div>
              <div className="flex items-center gap-2">
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
                <span>Bookings</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col relative">
            {/* Top bar */}
            <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
              {/* Sidebar toggle */}
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
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    L
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3">
                  <img src="/images/LOGO.png" alt="" />
                </div>
                {/* Greeting */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                    Good to see you Laksh....
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg">
                    Book OYO hotels at your favorite destinations!
                  </p>
                </div>
                <div className="w-full relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Search for hotels in Mumbai, Delhi, etc..."
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <VoiceRecorderButton
                      onTextReady={(text) =>
                        setMessageInput((prev) =>
                          prev ? `${prev} ${text}` : text
                        )
                      }
                    />
                    <button
                      onClick={handleSend}
                      disabled={loadingSearch}
                      className={`p-2 ${loadingSearch ? "opacity-50" : ""} ${
                        messageInput
                          ? "bg-[#FF5A5F] hover:bg-[#FF4A50]"
                          : "bg-white/20 hover:bg-white/30"
                      } rounded-full transition-colors`}
                    >
                      {loadingSearch ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
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
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  <div
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-[#FF5A5F]/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-[#FF5A5F] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-lg">OYO</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">OYO Hotels</h3>
                    <p className="text-sm text-gray-400">
                      Book hotels and stays across India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
