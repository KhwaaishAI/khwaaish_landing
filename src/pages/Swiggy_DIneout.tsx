import React, { useState } from "react";
import { Link } from "react-router-dom";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface RestaurantData {
  restaurant_name: string;
  restaurant_url: string;
  images: string[];
}

export default function SwiggyDineoutChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Popup states - all start as false
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [guests, setGuests] = useState(2);
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [offerType, setOfferType] = useState<"regular" | "special">("regular");

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantData | null>(null);

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

  const handleRestaurantSearch = async () => {
    console.log("STEP 01: Restaurant search triggered with:", messageInput);

    if (!messageInput.trim()) {
      console.log("STEP 01.1: Empty query");
      pushSystem("Please enter a restaurant name to search.");
      return;
    }

    setLoadingSearch(true);
    const userQuery = messageInput;
    pushUser(userQuery);
    setMessageInput("");

    try {
      const response = await fetch(`${BaseURL}/api/swiggy_dineout/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: userQuery,
        }),
      });

      const data = await response.json();
      console.log("STEP 01.2: Search API response:", data);

      if (data.status === "success" && data.data) {
        console.log("STEP 01.3: Found restaurant:", data.data.restaurant_name);
        setSelectedRestaurant(data.data);
        pushSystem(
          JSON.stringify({
            type: "restaurant_info",
            restaurant: data.data,
          })
        );
      } else {
        console.log("STEP 01.4: No restaurant found");
        pushSystem("Sorry, couldn't find that restaurant. Try another name.");
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      pushSystem("Something went wrong! Please try again.");
    }

    setLoadingSearch(false);
  };

  // Called when user clicks "Book Table" button
  const handleBookTableClick = () => {
    if (!selectedRestaurant) {
      alert("No restaurant selected");
      return;
    }
    console.log(
      "STEP 02: Book table clicked for:",
      selectedRestaurant.restaurant_name
    );
    setShowPhonePopup(true);
  };

  const handlePhoneSubmit = async () => {
    console.log("STEP 03: Phone submission started");
    console.log("STEP 03.1: Phone:", phone);

    if (!phone.trim() || phone.length < 10) {
      console.log("STEP 03.2: Invalid phone number");
      alert("Please enter a valid phone number");
      return;
    }

    setLoadingPhone(true);
    console.log("STEP 03.3: Book API request sending...");

    try {
      const res = await fetch(`${BaseURL}/api/swiggy_dineout/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_url: selectedRestaurant?.restaurant_url,
          phone_number: phone,
        }),
      });

      const data = await res.json();
      console.log("STEP 03.4: Book API response:", data);

      if (data.session_id && data.status === "success") {
        console.log(
          "STEP 03.5: Booking initiated, Session ID:",
          data.session_id
        );
        setSessionId(data.session_id);
        setShowPhonePopup(false);
        setShowOtpPopup(true);
      } else {
        console.log("STEP 03.6: Booking failed");
        alert("Booking failed. Try again.");
      }
    } catch (err) {
      console.log("STEP 03: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingPhone(false);
  };

  const handleOtpSubmit = async () => {
    console.log("STEP 04: OTP workflow started");
    console.log("STEP 04.1: OTP entered:", otp);

    if (!otp.trim() || !sessionId) {
      console.log("STEP 04.2: Missing OTP or session ID");
      return;
    }
    setLoadingOtp(true);
    console.log("STEP 04.3: OTP API request sending...");

    try {
      const res = await fetch(`${BaseURL}/api/swiggy_dineout/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      const data = await res.json();
      console.log("STEP 04.4: OTP API response:", data);

      if (data.status === "success") {
        console.log("STEP 04.5: OTP verification successful");
        setShowOtpPopup(false);
        setShowBookingPopup(true);
        pushSystem("OTP verified successfully! Please enter booking details.");
      } else {
        console.log("STEP 04.6: OTP verification failed");
        alert("Invalid OTP.");
      }
    } catch (err) {
      console.log("STEP 04: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleBookingConfirm = async () => {
    console.log("STEP 05: Booking confirmation started");
    console.log(
      "STEP 05.1: Guests:",
      guests,
      " Date:",
      dateText,
      " Time:",
      timeText
    );

    if (!dateText.trim() || !timeText.trim() || guests < 1) {
      console.log("STEP 05.2: Missing booking details");
      alert("Please fill all booking details");
      return;
    }

    setLoadingConfirm(true);
    console.log("STEP 05.3: Confirm API request sending...");

    try {
      const res = await fetch(`${BaseURL}/api/swiggy_dineout/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          guests: guests,
          date_text: dateText,
          time_text: timeText,
          offer_type: offerType,
        }),
      });

      const data = await res.json();
      console.log("STEP 05.4: Confirm API response:", data);

      if (data.status === "success") {
        console.log("STEP 05.5: Booking confirmed successfully");
        setShowBookingPopup(false);
        pushSystem(
          JSON.stringify({
            status: "success",
            message: `🎉 Booking confirmed for ${selectedRestaurant?.restaurant_name}! 
            \n📅 Date: ${dateText}
            \n⏰ Time: ${timeText}
            \n👥 Guests: ${guests}
            \n🎁 Offer Type: ${offerType}`,
          })
        );
        // Reset form
        setPhone("");
        setOtp("");
        setGuests(2);
        setDateText("");
        setTimeText("");
        setOfferType("regular");
        setSelectedRestaurant(null);
      } else {
        console.log("STEP 05.6: Booking confirmation failed");
        alert("Booking failed. Try again.");
      }
    } catch (err) {
      console.log("STEP 05: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingConfirm(false);
  };

  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "restaurant_info") {
      const restaurant = parsed.restaurant;
      content = (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">Found Restaurant:</h3>

          <div className="max-w-5xl">
            {/* Restaurant Card */}
            <div className="bg-[#11121a] rounded-2xl overflow-hidden border border-gray-800">
              {/* Main Image */}
              {restaurant.images && restaurant.images.length > 0 && (
                <div className="relative h-48 sm:h-56 md:h-64">
                  <img
                    src={restaurant.images[1] || restaurant.images[0]}
                    alt={restaurant.restaurant_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add(
                        "bg-gray-800"
                      );
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {restaurant.restaurant_name}
                  </h2>
                  <a
                    href={restaurant.restaurant_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    View on Swiggy Dineout →
                  </a>
                </div>

                {/* Image Gallery */}
                {restaurant.images && restaurant.images.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">More images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {restaurant.images
                        .slice(1, 5)
                        .map((img: string, index: number) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden bg-gray-800"
                          >
                            <img
                              src={img}
                              alt={`Restaurant view ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement?.classList.add(
                                  "bg-gray-900"
                                );
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBookTableClick}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-red-500/25"
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
                  Book Table
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (
      typeof parsed === "object" &&
      parsed?.status?.toLowerCase() === "success"
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

    return typeof parsed === "object" && parsed?.type === "restaurant_info" ? (
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

  const handleSend = () => {
    if (!messageInput.trim() || loadingSearch) return;
    setShowChat(true);
    handleRestaurantSearch();
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS - Only show when triggered */}

      {/* PHONE POPUP - Shows after clicking Book Table */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Book Table</h2>
                <p className="text-sm text-gray-400">
                  {selectedRestaurant?.restaurant_name}
                </p>
              </div>
            </div>

            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhonePopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePhoneSubmit}
                disabled={loadingPhone || phone.length < 10}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingPhone ? <PopupLoader /> : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP POPUP - Shows after phone submission */}
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
              onChange={(e) => setOtp(e.target.value)}
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
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingOtp ? <PopupLoader /> : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS POPUP - Shows after OTP verification */}
      {showBookingPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 md:w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Complete Your Booking
            </h2>
            <p className="text-sm text-gray-400">
              {selectedRestaurant?.restaurant_name}
            </p>

            <div className="space-y-4">
              {/* Guests */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Number of Guests
                </label>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                  >
                    <span className="text-xl">-</span>
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{guests}</div>
                    <div className="text-xs text-gray-400">Guests</div>
                  </div>
                  <button
                    onClick={() => setGuests((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Date</label>
                <input
                  type="text"
                  placeholder="e.g., Today, Tomorrow, 25th Dec"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
                <div className="flex gap-2 mt-2">
                  {["Today", "Tomorrow", "Weekend"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setDateText(option)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        dateText === option
                          ? "bg-red-600"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Time</label>
                <input
                  type="text"
                  placeholder="e.g., 7:30 PM, 8:00 PM"
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"].map(
                    (time) => (
                      <button
                        key={time}
                        onClick={() => setTimeText(time)}
                        className={`text-xs px-2 py-1 rounded-lg ${
                          timeText === time
                            ? "bg-red-600"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Offer Type */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Offer Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOfferType("regular")}
                    className={`flex-1 py-2 rounded-lg border ${
                      offerType === "regular"
                        ? "bg-red-600 border-red-500"
                        : "bg-white/10 border-gray-700"
                    }`}
                  >
                    Regular Offer
                  </button>
                  <button
                    onClick={() => setOfferType("special")}
                    className={`flex-1 py-2 rounded-lg border ${
                      offerType === "special"
                        ? "bg-red-600 border-red-500"
                        : "bg-white/10 border-gray-700"
                    }`}
                  >
                    Special Offer
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBookingPopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingConfirm}
                disabled={loadingConfirm || !dateText || !timeText}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingConfirm ? <PopupLoader /> : "Confirm Booking"}
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
                placeholder="Search for restaurants..."
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
                    ? "bg-red-600 hover:bg-red-500"
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
                    Book tables at your favorite restaurants!
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
                    placeholder="Search for restaurants..."
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={handleSend}
                      disabled={loadingSearch}
                      className={`p-2 ${loadingSearch ? "opacity-50" : ""} ${
                        messageInput
                          ? "bg-red-600 hover:bg-red-500"
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
                  <Link
                    to="/"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {" "}
                      Swiggy Dineout
                    </h3>
                    <p className="text-sm text-gray-400">
                      Book tables at fine dining restaurants
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
