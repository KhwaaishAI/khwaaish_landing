import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface Hotel {
  name: string;
  url: string;
  image_url: string;
  rating_score: string;
  rating_text: string;
  review_count: string;
  location: string;
  landmark: string;
  original_price: string;
  price: string;
  badges: string[];
  offers: string[];
}

interface ExtractedData {
  destination: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms: number;
}

const BaseURL = import.meta.env.VITE_API_BASE_URL || "";

export default function AgodaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Popup states
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Form states
  const [sessionId, setSessionId] = useState("default");
  const [pendingHotel, setPendingHotel] = useState<Hotel | null>(null);

  // Booking form
  const [bookingParams, setBookingParams] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  // Payment form
  const [paymentParams, setPaymentParams] = useState({
    upi_id: "",
    payment_method: "digital" as "digital",
  });

  // Loading states
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

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

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    const userMessage = messageInput.trim();
    pushUser(userMessage);
    setMessageInput("");
    setShowChat(true);
    setIsLoading(true);
    setLoadingChat(true);

    try {
      const response = await fetch(`${BaseURL}/api/agoda/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      console.log("Agoda chat response:", data);

      // Update session ID if provided
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      // Add system response
      if (data.response) {
        pushSystem(data.response);
      }

      // If search results are available, add them as a special message
      if (data.search_results?.results?.length > 0) {
        pushSystem(
          JSON.stringify({
            type: "hotel_list",
            hotels: data.search_results.results.filter(
              (h: Hotel) => h.name && h.url
            ),
            extracted_data: data.extracted_data,
            session_id: data.session_id || sessionId,
          })
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      pushSystem("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingChat(false);
    }
  };

  const handleBooking = async () => {
    if (!pendingHotel || !pendingHotel.url) {
      pushSystem("Please select a valid hotel first.");
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
      const res = await fetch(`${BaseURL}/api/agoda/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          hotel_url: pendingHotel.url,
          ...bookingParams,
        }),
      });

      const data = await res.json();
      console.log("Booking response:", data);

      if (data.success || data.status === "success") {
        // Show booking confirmation
        pushSystem(
          JSON.stringify({
            type: "booking_confirmation",
            hotel_name: pendingHotel.name,
            guest_name: `${bookingParams.first_name} ${bookingParams.last_name}`,
            email: bookingParams.email,
            phone: bookingParams.phone_number,
          })
        );

        // Show payment popup
        setShowBookingPopup(false);
        setShowPaymentPopup(true);
        setPendingHotel(null);
      } else {
        pushSystem("❌ Failed to book hotel. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      pushSystem("❌ Failed to complete booking!");
    }

    setLoadingBooking(false);
  };

  const handlePayment = async () => {
    if (!paymentParams.upi_id) {
      alert("Please enter UPI ID");
      return;
    }

    setLoadingPayment(true);

    try {
      const res = await fetch(`${BaseURL}/api/agoda/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          payment_method: "digital",
          card_number: "",
          card_holder_name: "",
          expiry_date: "",
          cvc: "",
          upi_id: paymentParams.upi_id,
        }),
      });

      const data = await res.json();
      console.log("Payment response:", data);

      if (data.success || data.status === "success") {
        pushSystem(
          JSON.stringify({
            type: "payment_success",
            booking_id:
              data.booking_id ||
              "AGODA" + Math.random().toString(36).substr(2, 8).toUpperCase(),
            hotel_name: pendingHotel?.name || "Selected Hotel",
            amount: data.amount || pendingHotel?.price || "",
            upi_id: paymentParams.upi_id,
          })
        );
        setShowPaymentPopup(false);
        setPaymentParams({ upi_id: "", payment_method: "digital" });
      } else {
        pushSystem("❌ Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      pushSystem("❌ Payment processing failed!");
    }

    setLoadingPayment(false);
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
      const hotels = parsed.hotels || [];
      const extractedData = parsed.extracted_data as ExtractedData;

      content = (
        <div className="space-y-4">
          {extractedData && (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl mb-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">
                  🏨 Hotels in {extractedData.destination}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-400"
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
                    <span>Check-in: {extractedData.check_in}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-400"
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
                    <span>Check-out: {extractedData.check_out}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-400"
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
                    <span>
                      {extractedData.adults} adults • {extractedData.rooms}{" "}
                      rooms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.map((hotel: Hotel, index: number) => {
                if (!hotel.name || !hotel.url) return null;

                const isSelected = pendingHotel?.url === hotel.url;
                const imageUrl = hotel.image_url?.startsWith("//")
                  ? `https:${hotel.image_url}`
                  : hotel.image_url || "/images/hotel-placeholder.jpg";

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setPendingHotel(hotel);
                      setShowBookingPopup(true);
                    }}
                    className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-green-500 bg-[#1e1416]"
                        : "hover:bg-[#151622] hover:shadow-lg"
                    }`}
                  >
                    <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900">
                      <img
                        src={imageUrl}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/hotel-placeholder.jpg";
                        }}
                      />
                      {hotel.badges && hotel.badges.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {hotel.badges.slice(0, 2).map((badge, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-black/80 text-xs text-white rounded-full"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                      {hotel.rating_score && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full text-xs">
                          <span className="text-yellow-300">⭐</span>
                          <span className="text-white font-medium">
                            {hotel.rating_score}{" "}
                            {hotel.rating_text && `(${hotel.rating_text})`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col p-4 gap-3">
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white line-clamp-2">
                          {hotel.name}
                        </h4>
                        {hotel.location && (
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
                            </svg>
                            <span className="line-clamp-1">
                              {hotel.location}
                            </span>
                          </p>
                        )}
                        {hotel.landmark && (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            📍 {hotel.landmark}
                          </p>
                        )}
                      </div>

                      {hotel.review_count && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {hotel.review_count}
                          </span>
                        </div>
                      )}

                      {hotel.offers && hotel.offers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {hotel.offers.slice(0, 2).map((offer, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-green-900/40 text-green-300 rounded"
                            >
                              {offer}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-white">
                            {hotel.price || "Price on request"}
                          </p>
                          {hotel.original_price &&
                            hotel.original_price !== hotel.price && (
                              <p className="text-sm text-gray-400 line-through">
                                {hotel.original_price}
                              </p>
                            )}
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
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
      parsed?.type === "booking_confirmation"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-bold text-green-400 text-lg">
                  ✅ Booking Request Submitted!
                </p>
                <p className="text-sm text-green-300 mt-1">
                  Your booking request for{" "}
                  <span className="font-semibold text-white">
                    {parsed.hotel_name}
                  </span>{" "}
                  has been submitted.
                </p>
              </div>

              <div className="p-4 bg-black/30 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Guest Name</p>
                    <p className="font-semibold text-white">
                      {parsed.guest_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-semibold text-white">{parsed.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-semibold text-white">{parsed.phone}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-green-400/80">
                Please complete the payment to confirm your booking.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (
      typeof parsed === "object" &&
      parsed?.type === "payment_success"
    ) {
      content = (
        <div className="p-5 bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-blue-600/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                <p className="font-bold text-blue-400 text-xl">
                  🎉 Booking Confirmed & Paid!
                </p>
                <p className="text-sm text-blue-300 mt-1">
                  Your stay at{" "}
                  <span className="font-semibold text-white">
                    {parsed.hotel_name}
                  </span>{" "}
                  is confirmed.
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
                  <p className="text-xs text-gray-400">Amount Paid</p>
                  <p className="font-semibold text-white">{parsed.amount}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Payment Method</p>
                  <p className="font-semibold text-white">UPI (Digital)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">UPI ID</p>
                  <p className="font-semibold text-white">{parsed.upi_id}</p>
                </div>
              </div>

              <p className="text-xs text-blue-400/80 pt-2 border-t border-blue-500/20">
                📧 Confirmation email has been sent with all details.
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
                  /([🏨✨🔍💡📍⭐✅❌🎉📧📱])/g,
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
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-700"
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
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700">
                    <img
                      src={
                        pendingHotel.image_url?.startsWith("//")
                          ? `https:${pendingHotel.image_url}`
                          : pendingHotel.image_url
                      }
                      alt={pendingHotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/hotel-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white line-clamp-2">
                      {pendingHotel.name}
                    </h3>
                    {pendingHotel.location && (
                      <p className="text-sm text-gray-300 line-clamp-1">
                        {pendingHotel.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-white">
                        {pendingHotel.price || "Price on request"}
                      </span>
                      {pendingHotel.rating_score && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-300">⭐</span>
                          <span className="text-sm text-gray-300">
                            {pendingHotel.rating_score}
                          </span>
                        </div>
                      )}
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Confirm Booking Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT POPUP */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-6 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Complete Payment
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Digital Payment via UPI
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentPopup(false)}
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@upi"
                    value={paymentParams.upi_id}
                    onChange={(e) =>
                      setPaymentParams((prev) => ({
                        ...prev,
                        upi_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-500">
                    Enter your UPI ID (e.g., username@oksbi, username@ybl)
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-300">
                    Payment Method:{" "}
                    <span className="font-semibold text-white">
                      Digital (UPI)
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Secure payment processed through UPI gateway
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loadingPayment || !paymentParams.upi_id}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                {loadingPayment ? (
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
                    Pay Now
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
                  alt="Agoda AI"
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

            <div className="px-3 mt-4">
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
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
                <span>New Chat</span>
              </button>
            </div>
          </aside>

          {/* Chat Messages */}
          <div className="ml-0 md:ml-64 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
            {isLoading && <FlowerLoader />}
          </div>

          {/* Message Input */}
          <div
            className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 
                       bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your hotel search request... (e.g., hotels in Goa from 2jan to 5jan for 2 people)"
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                disabled={loadingChat}
              />

              <button
                onClick={handleSend}
                disabled={loadingChat || !messageInput.trim()}
                className={`p-2.5 rounded-full ${
                  messageInput && !loadingChat
                    ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
                    : "bg-white/20 hover:bg-white/30"
                } transition-all`}
              >
                {loadingChat ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          </div>
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
              {/* Brand logo - clicking opens sidebar if ever used when closed */}
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
              {/* Collapse / Toggle inside sidebar */}
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
                  //   setMessages([]);
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Drafts</span>
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
                    What can I help you with today?
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
                    placeholder="e.g., hotels in Goa from 2jan to 5jan for 2 people and need 2 room"
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleSend()}
                      className={`p-2 ${
                        messageInput
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-white/20 hover:bg-white/30"
                      } rounded-full transition-colors`}
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Card */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  <Link
                    to="/hotels"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
                  border border-gray-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Hotels</h3>
                    <p className="text-sm text-gray-400">
                      Book a Hotel at best price possible
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
