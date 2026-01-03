import React, { useState, useRef, useEffect } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

// Hotel Interfaces for different platforms
interface AgodaHotel {
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

interface OyoHotel {
  hotel_id: string;
  name: string;
  location: string;
  imageurl: string;
  price: string;
  facilities: { [key: string]: string }[];
  rating: string;
  hotel_url: string;
  booking_url: string;
}

interface BookingHotel {
  name: string;
  url?: string;
  image_url?: string;
  rating?: string;
  location?: string;
  price?: string;
}

interface ExtractedData {
  destination: string;
  check_in?: string;
  check_out?: string;
  adults: number;
  children: number;
  rooms: number;
}

interface PlatformResults {
  platform: "agoda" | "oyo" | "booking";
  status: "loading" | "success" | "error";
  data: any;
  hotels: any[];
  extractedData?: ExtractedData;
  sessionId?: string;
}

interface ComparisonHotel {
  name: string;
  agodaPrice: string;
  oyoPrice: string;
  bookingPrice: string;
  agodaHotel: any | null;
  oyoHotel: any | null;
  bookingHotel: any | null;
  bestPrice: {
    platform: "agoda" | "oyo" | "booking";
    price: string;
  };
}

const BaseURL = import.meta.env.VITE_API_BASE_URL || "";

export default function HotelsComparison() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Refs for horizontal scrolling
  const agodaScrollRef = useRef<HTMLDivElement>(null);
  const oyoScrollRef = useRef<HTMLDivElement>(null);
  const bookingScrollRef = useRef<HTMLDivElement>(null);

  // Popup states
  const [showOyoLoginPopup, setShowOyoLoginPopup] = useState(false);
  const [showOyoOtpPopup, setShowOyoOtpPopup] = useState(false);
  const [showBookingLoginPopup, setShowBookingLoginPopup] = useState(false);
  const [showBookingOtpPopup, setShowBookingOtpPopup] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Form states
  const [platformResults, setPlatformResults] = useState<PlatformResults[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "agoda" | "oyo" | "booking" | null
  >(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // OYO states
  const [oyoPhone, setOyoPhone] = useState("");
  const [oyoOtp, setOyoOtp] = useState("");
  const [oyoSession, setOyoSession] = useState("");
  const [oyoUpi, setOyoUpi] = useState("");

  // Booking.com states
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingOtp, setBookingOtp] = useState("");
  const [bookingSessionId, setBookingSessionId] = useState("");

  // Agoda states
  const [agodaSessionId, setAgodaSessionId] = useState("default");

  // Booking form (common for all)
  const [bookingParams, setBookingParams] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  // Payment form
  const [paymentParams, setPaymentParams] = useState({
    upi_id: "",
    payment_method: "digital" as const,
  });

  // Loading states
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingOyoLogin, setLoadingOyoLogin] = useState(false);
  const [loadingOyoOtp, setLoadingOyoOtp] = useState(false);
  const [loadingBookingLogin, setLoadingBookingLogin] = useState(false);
  const [loadingBookingOtp, setLoadingBookingOtp] = useState(false);
  const [loadingFinalBooking, setLoadingFinalBooking] = useState(false);
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

  // Horizontal scroll functions
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Function to extract comparison hotels
  const extractComparisonHotels = (
    results: PlatformResults[]
  ): {
    comparisonHotels: ComparisonHotel[];
    unmatchedHotels: {
      agoda: any[];
      oyo: any[];
      booking: any[];
    };
  } => {
    const comparisonHotels: ComparisonHotel[] = [];
    const unmatchedHotels = {
      agoda: [] as any[],
      oyo: [] as any[],
      booking: [] as any[],
    };

    // Helper function to get first two words
    const getFirstTwoWords = (name: string): string => {
      const words = name?.split(" ") || [];
      return words
        .slice(0, 2)
        .join(" ")
        .toLowerCase()
        .replace(/[^\w\s]/gi, "");
    };

    // Get all hotels from each platform
    const agodaHotels =
      results.find((r) => r.platform === "agoda")?.hotels || [];
    const oyoHotels = results.find((r) => r.platform === "oyo")?.hotels || [];
    const bookingHotels =
      results.find((r) => r.platform === "booking")?.hotels || [];

    // Create a map for quick lookup
    const hotelMap = new Map<
      string,
      {
        name: string;
        agoda: any | null;
        oyo: any | null;
        booking: any | null;
      }
    >();

    // Process Agoda hotels
    agodaHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      if (!hotelMap.has(key)) {
        hotelMap.set(key, {
          name: hotel.name,
          agoda: hotel,
          oyo: null,
          booking: null,
        });
      } else {
        const existing = hotelMap.get(key)!;
        existing.agoda = hotel;
        // Keep the most complete name
        if (hotel.name.length > existing.name.length) {
          existing.name = hotel.name;
        }
      }
    });

    // Process OYO hotels
    oyoHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      if (!hotelMap.has(key)) {
        hotelMap.set(key, {
          name: hotel.name,
          agoda: null,
          oyo: hotel,
          booking: null,
        });
      } else {
        const existing = hotelMap.get(key)!;
        existing.oyo = hotel;
      }
    });

    // Process Booking hotels
    bookingHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      if (!hotelMap.has(key)) {
        hotelMap.set(key, {
          name: hotel.name,
          agoda: null,
          oyo: null,
          booking: hotel,
        });
      } else {
        const existing = hotelMap.get(key)!;
        existing.booking = hotel;
      }
    });

    // Convert map to comparison hotels
    hotelMap.forEach((hotelData, key) => {
      const agodaPrice = hotelData.agoda?.price || "--";
      const oyoPrice = hotelData.oyo?.price || "--";
      const bookingPrice = hotelData.booking?.price || "--";

      // Find best price
      const prices = [
        { platform: "agoda" as const, price: agodaPrice },
        { platform: "oyo" as const, price: oyoPrice },
        { platform: "booking" as const, price: bookingPrice },
      ].filter((p) => p.price !== "--");

      let bestPrice = { platform: "agoda" as const, price: "--" };
      if (prices.length > 0) {
        // Convert price strings to numbers for comparison
        const numericPrices = prices.map((p) => ({
          ...p,
          numeric: parseFloat(p.price.replace(/[^\d.]/g, "")) || Infinity,
        }));
        numericPrices.sort((a, b) => a.numeric - b.numeric);
        bestPrice = {
          platform: numericPrices[0].platform,
          price: numericPrices[0].price,
        };
      }

      comparisonHotels.push({
        name: hotelData.name,
        agodaPrice,
        oyoPrice,
        bookingPrice,
        agodaHotel: hotelData.agoda,
        oyoHotel: hotelData.oyo,
        bookingHotel: hotelData.booking,
        bestPrice,
      });
    });

    // Collect unmatched hotels (hotels that only exist on one platform)
    agodaHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      const entry = hotelMap.get(key);
      if (entry && !entry.oyo && !entry.booking) {
        unmatchedHotels.agoda.push(hotel);
      }
    });

    oyoHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      const entry = hotelMap.get(key);
      if (entry && !entry.agoda && !entry.booking) {
        unmatchedHotels.oyo.push(hotel);
      }
    });

    bookingHotels.forEach((hotel) => {
      const key = getFirstTwoWords(hotel.name);
      const entry = hotelMap.get(key);
      if (entry && !entry.agoda && !entry.oyo) {
        unmatchedHotels.booking.push(hotel);
      }
    });

    return { comparisonHotels, unmatchedHotels };
  };

  // Search all platforms simultaneously
  const handleSearchAll = async () => {
    console.log("handleSearchAll called");
    console.log("Message input:", messageInput);

    if (!messageInput.trim()) {
      console.log("Empty message, returning");
      return;
    }

    const userMessage = messageInput.trim();
    pushUser(userMessage);
    setMessageInput("");
    setShowChat(true);
    setIsLoading(true);
    setLoadingSearch(true);

    console.log("Resetting platform results...");
    // Reset previous results
    setPlatformResults([
      { platform: "agoda", status: "loading", data: null, hotels: [] },
      { platform: "oyo", status: "loading", data: null, hotels: [] },
      { platform: "booking", status: "loading", data: null, hotels: [] },
    ]);

    try {
      console.log("Calling all APIs in parallel...");
      // Call all APIs in parallel
      console.log("Agoda Request Body:", {
        message: userMessage,
        session_id: agodaSessionId,
      });
      console.log("OYO Request Body:", {
        message: userMessage,
      });
      console.log("Booking Request Body:", {
        message: userMessage,
      });
      const [agodaResponse, oyoResponse, bookingResponse] =
        await Promise.allSettled([
          // Agoda API
          fetch(`${BaseURL}/api/agoda/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMessage,
              session_id: agodaSessionId,
            }),
          }),

          // OYO API
          fetch(`${BaseURL}/oyo_automation/oyo/search/natural`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: userMessage,
            }),
          }),

          // Booking.com API
          fetch(`${BaseURL}/api/booking/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMessage,
            }),
          }),
        ]);

      console.log("API Responses received:");
      console.log("Agoda response status:", agodaResponse.status);
      console.log("OYO response status:", oyoResponse.status);
      console.log("Booking.com response status:", bookingResponse.status);

      const results: PlatformResults[] = [];

      // Process Agoda response
      if (agodaResponse.status === "fulfilled") {
        try {
          console.log("Processing Agoda response...");
          const data = await agodaResponse.value.json();
          console.log("Agoda raw data:", data);
          const hotels =
            data.search_results?.results?.filter(
              (h: AgodaHotel) => h.name && h.url
            ) || [];
          console.log(`Agoda filtered hotels: ${hotels.length}`);
          results.push({
            platform: "agoda",
            status: "success",
            data,
            hotels,
            extractedData: data.extracted_data,
            sessionId: data.session_id || data.search_results?.session_id,
          });
          if (data.session_id) {
            console.log("Agoda session ID updated:", data.session_id);
            setAgodaSessionId(data.session_id);
          }
        } catch (error) {
          console.error("Agoda processing error:", error);
          results.push({
            platform: "agoda",
            status: "error",
            data: null,
            hotels: [],
          });
        }
      } else {
        console.error("Agoda request failed:", agodaResponse.reason);
        results.push({
          platform: "agoda",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      // Process OYO response
      if (oyoResponse.status === "fulfilled") {
        try {
          console.log("Processing OYO response...");
          const data = await oyoResponse.value.json();
          console.log("OYO raw data:", data);
          const hotels = data.hotels || [];
          console.log(`OYO hotels: ${hotels.length}`);
          results.push({
            platform: "oyo",
            status: "success",
            data,
            hotels,
            extractedData: {
              destination:
                userMessage.match(/in\s+([^,\s]+)/)?.[1] || "Destination",
              adults: 2,
              children: 0,
              rooms: 2,
            },
          });
        } catch (error) {
          console.error("OYO processing error:", error);
          results.push({
            platform: "oyo",
            status: "error",
            data: null,
            hotels: [],
          });
        }
      } else {
        console.error("OYO request failed:", oyoResponse.reason);
        results.push({
          platform: "oyo",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      // Process Booking.com response
      if (bookingResponse.status === "fulfilled") {
        try {
          console.log("Processing Booking.com response...");
          const data = await bookingResponse.value.json();
          console.log("Booking.com raw data:", data);
          const hotels = data.search_results?.results || [];
          console.log(`Booking.com hotels: ${hotels.length}`);
          results.push({
            platform: "booking",
            status: "success",
            data,
            hotels,
            extractedData: data.extracted_data,
            sessionId: data.session_id || data.search_results?.session_id,
          });
          if (data.session_id) {
            console.log("Booking.com session ID updated:", data.session_id);
            setBookingSessionId(data.session_id);
          }
        } catch (error) {
          console.error("Booking.com processing error:", error);
          results.push({
            platform: "booking",
            status: "error",
            data: null,
            hotels: [],
          });
        }
      } else {
        console.error("Booking.com request failed:", bookingResponse.reason);
        results.push({
          platform: "booking",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      console.log("Final results:", results);
      setPlatformResults(results);

      // Show comparison results
      pushSystem(
        JSON.stringify({
          type: "comparison_results",
          results: results,
          query: userMessage,
        })
      );
    } catch (error) {
      console.error("Search error:", error);
      pushSystem(
        "Sorry, I encountered an error while searching. Please try again."
      );
    } finally {
      console.log("Search completed");
      setIsLoading(false);
      setLoadingSearch(false);
    }
  };

  // Handle hotel selection via Book button
  const handleBookHotel = async (
    platform: "agoda" | "oyo" | "booking",
    hotel: any
  ) => {
    console.log("Book button clicked");
    console.log("Platform:", platform);
    console.log("Hotel:", hotel);

    setSelectedPlatform(platform);
    setSelectedHotel(hotel);

    switch (platform) {
      case "oyo":
        console.log("Showing OYO login popup");
        // Try OYO login first
        await handleOyoLoginWithAutoCheck(hotel);
        break;
      case "booking":
        console.log("Showing Booking.com login popup");
        setShowBookingLoginPopup(true);
        break;
      case "agoda":
        console.log("Showing Agoda booking popup directly");
        setShowBookingPopup(true);
        break;
    }
  };

  // OYO Login with auto-check for already logged in status
  const handleOyoLoginWithAutoCheck = async (hotel: any) => {
    console.log("OYO login with auto-check called");

    if (!oyoPhone.trim()) {
      console.log("No phone number, showing login popup");
      setShowOyoLoginPopup(true);
      return;
    }

    setLoadingOyoLogin(true);
    console.log("Calling OYO login API...");

    try {
      const res = await fetch(`${BaseURL}/oyo_automation/oyo/login/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: oyoPhone }),
      });

      console.log("OYO login response status:", res.status);
      const data = await res.json();
      console.log("OYO login response data:", data);

      if (data.status === "already_logged_in") {
        console.log("Already logged in to OYO, showing booking popup directly");
        setShowOyoLoginPopup(false);
        setShowBookingPopup(true);
      } else if (
        data.success ||
        data.status === "ok" ||
        data.status === "otp_sent"
      ) {
        console.log("OYO login successful, showing OTP popup");
        setShowOyoLoginPopup(false);
        setShowOyoOtpPopup(true);
      } else {
        console.log("OYO login failed");
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("OYO login error:", error);
      alert("Something went wrong!");
    }

    setLoadingOyoLogin(false);
    console.log("OYO login completed");
  };

  // OYO Login (regular)
  const handleOyoLogin = async () => {
    console.log("OYO Login called");
    console.log("Phone:", oyoPhone);

    if (!oyoPhone.trim()) {
      console.log("No phone number provided");
      alert("Please enter phone number");
      return;
    }

    setLoadingOyoLogin(true);
    console.log("Calling OYO login API...");

    try {
      const res = await fetch(`${BaseURL}/oyo_automation/oyo/login/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: oyoPhone }),
      });

      console.log("OYO login response status:", res.status);
      const data = await res.json();
      console.log("OYO login response data:", data);

      if (data.status === "already_logged_in") {
        console.log("Already logged in to OYO, showing booking popup directly");
        setShowOyoLoginPopup(false);
        setShowBookingPopup(true);
      } else if (data.success || data.status === "ok") {
        console.log("OYO login successful, showing OTP popup");
        setShowOyoLoginPopup(false);
        setShowOyoOtpPopup(true);
      } else {
        console.log("OYO login failed");
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("OYO login error:", error);
      alert("Something went wrong!");
    }

    setLoadingOyoLogin(false);
    console.log("OYO login completed");
  };

  // OYO OTP Verification
  const handleOyoOtpVerify = async () => {
    console.log("OYO OTP Verification called");
    console.log("Phone:", oyoPhone);
    console.log("OTP:", oyoOtp);

    if (!oyoOtp.trim()) {
      console.log("No OTP provided");
      alert("Please enter OTP");
      return;
    }

    setLoadingOyoOtp(true);
    console.log("Calling OYO OTP verification API...");

    try {
      const res = await fetch(`${BaseURL}/oyo_automation/oyo/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: oyoPhone,
          otp: oyoOtp,
        }),
      });

      console.log("OYO OTP response status:", res.status);
      const data = await res.json();
      console.log("OYO OTP response data:", data);

      if (
        data.success ||
        data.status === "ok" ||
        data.status === "already_logged_in"
      ) {
        console.log("OYO OTP verification successful, showing booking popup");
        setShowOyoOtpPopup(false);
        setShowBookingPopup(true);
      } else {
        console.log("Invalid OTP");
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OYO OTP error:", error);
      alert("Something went wrong!");
    }

    setLoadingOyoOtp(false);
    console.log("OYO OTP verification completed");
  };

  // Booking.com Login
  const handleBookingLogin = async () => {
    console.log("Booking.com Login called");
    console.log("Email:", bookingEmail);

    if (!bookingEmail.trim() || !bookingEmail.includes("@")) {
      console.log("Invalid email");
      alert("Please enter valid email");
      return;
    }

    setLoadingBookingLogin(true);
    console.log("Calling Booking.com login API...");

    try {
      const res = await fetch(`${BaseURL}/api/booking/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: bookingEmail }),
      });

      console.log("Booking.com login response status:", res.status);
      const data = await res.json();
      console.log("Booking.com login response data:", data);

      if (data.session_id) {
        console.log(
          "Booking.com login successful, session ID:",
          data.session_id
        );
        setBookingSessionId(data.session_id);
        setShowBookingLoginPopup(false);
        setShowBookingOtpPopup(true);
      } else {
        console.log("Booking.com login failed");
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking.com login error:", error);
      alert("Something went wrong!");
    }

    setLoadingBookingLogin(false);
    console.log("Booking.com login completed");
  };

  // Booking.com OTP Verification
  const handleBookingOtpVerify = async () => {
    console.log("Booking.com OTP Verification called");
    console.log("Session ID:", bookingSessionId);
    console.log("OTP:", bookingOtp);

    if (!bookingOtp.trim()) {
      console.log("No OTP provided");
      alert("Please enter OTP");
      return;
    }

    setLoadingBookingOtp(true);
    console.log("Calling Booking.com OTP verification API...");

    try {
      const res = await fetch(`${BaseURL}/api/booking/submit-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: bookingSessionId,
          otp: bookingOtp,
        }),
      });

      console.log("Booking.com OTP response status:", res.status);
      const data = await res.json();
      console.log("Booking.com OTP response data:", data);

      if (data.status === "success" || data.success) {
        console.log(
          "Booking.com OTP verification successful, showing booking popup"
        );
        setShowBookingOtpPopup(false);
        setShowBookingPopup(true);
      } else {
        console.log("Invalid OTP");
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Booking.com OTP error:", error);
      alert("Something went wrong!");
    }

    setLoadingBookingOtp(false);
    console.log("Booking.com OTP verification completed");
  };

  // Final Booking (common for all platforms)
  const handleFinalBooking = async () => {
    console.log("Final Booking called");
    console.log("Platform:", selectedPlatform);
    console.log("Hotel:", selectedHotel);
    console.log("Booking params:", bookingParams);

    if (!selectedHotel || !selectedPlatform) {
      console.log("No hotel or platform selected");
      alert("Please select a hotel first");
      return;
    }

    if (
      !bookingParams.first_name ||
      !bookingParams.last_name ||
      !bookingParams.email ||
      !bookingParams.phone_number
    ) {
      console.log("Incomplete booking details");
      alert("Please fill all booking details");
      return;
    }

    setLoadingFinalBooking(true);
    console.log("Starting final booking process...");

    try {
      let endpoint = "";
      let body: any = {};

      switch (selectedPlatform) {
        case "agoda":
          endpoint = `${BaseURL}/api/agoda/book`;
          body = {
            session_id: agodaSessionId,
            hotel_url: selectedHotel.url,
            ...bookingParams,
          };
          console.log("Agoda booking payload:", body);
          break;

        case "oyo":
          endpoint = `${BaseURL}/oyo_automation/book`;
          body = {
            phone_number: bookingParams.phone_number,
            hotel_url: selectedHotel.hotel_url || selectedHotel.url,
            name: `${bookingParams.first_name} ${bookingParams.last_name}`,
            email: bookingParams.email,
            pay_mode: "pay_now",
            upi_id: oyoUpi,
            headless: true,
          };
          console.log("OYO booking payload:", body);
          break;

        case "booking":
          endpoint = `${BaseURL}/api/booking/book`;
          body = {
            session_id: bookingSessionId,
            property_url: selectedHotel.url,
            ...bookingParams,
          };
          console.log("Booking.com booking payload:", body);
          break;
      }

      console.log("Calling booking API:", endpoint);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Booking response status:", res.status);
      const data = await res.json();
      console.log("Booking response data:", data);

      if (data.success || data.status === "success" || data.status === "ok") {
        console.log("Booking successful");
        pushSystem(
          JSON.stringify({
            type: "booking_confirmation",
            platform: selectedPlatform,
            hotel_name: selectedHotel.name,
            guest_name: `${bookingParams.first_name} ${bookingParams.last_name}`,
            email: bookingParams.email,
            phone: bookingParams.phone_number,
          })
        );

        setShowBookingPopup(false);
        // setShowPaymentPopup(true);
      } else {
        console.log("Booking failed");
        pushSystem(
          `Failed to book on ${selectedPlatform.toUpperCase()}. Please try again.`
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      pushSystem("Failed to complete booking!");
    }

    setLoadingFinalBooking(false);
    console.log("Final booking completed");
  };

  // Payment
  const handlePayment = async () => {
    console.log("Payment called");
    console.log("UPI ID:", paymentParams.upi_id);
    console.log("Platform:", selectedPlatform);

    if (!paymentParams.upi_id) {
      console.log("No UPI ID provided");
      alert("Please enter UPI ID");
      return;
    }

    setLoadingPayment(true);
    console.log("Starting payment process...");

    try {
      let endpoint = "";
      let body: any = {};

      switch (selectedPlatform) {
        case "agoda":
          endpoint = `${BaseURL}/api/agoda/pay`;
          body = {
            session_id: agodaSessionId,
            payment_method: "digital",
            card_number: "",
            card_holder_name: "",
            expiry_date: "",
            cvc: "",
            upi_id: paymentParams.upi_id,
          };
          console.log("Agoda payment payload:", body);
          break;

        case "oyo":
          // For OYO, payment is included in booking API
          endpoint = `${BaseURL}/oyo_automation/book`;
          body = {
            phone_number: bookingParams.phone_number,
            hotel_url: selectedHotel.hotel_url || selectedHotel.url,
            name: `${bookingParams.first_name} ${bookingParams.last_name}`,
            email: bookingParams.email,
            pay_mode: "pay_now",
            upi_id: paymentParams.upi_id,
            headless: true,
          };
          console.log("OYO payment payload:", body);
          break;

        case "booking":
          // Booking.com might not have separate payment API
          // Show success message directly
          console.log("Booking.com - No separate payment API");
          break;
      }

      if (selectedPlatform === "booking") {
        // For Booking.com, just show success
        console.log("Booking.com payment simulated");
        pushSystem(
          JSON.stringify({
            type: "payment_success",
            platform: selectedPlatform,
            booking_id:
              "BOOKING-" +
              Math.random().toString(36).substr(2, 8).toUpperCase(),
            hotel_name: selectedHotel?.name || "Selected Hotel",
            amount: selectedHotel?.price || "",
            upi_id: paymentParams.upi_id,
          })
        );
      } else {
        console.log("Calling payment API:", endpoint);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        console.log("Payment response status:", res.status);
        const data = await res.json();
        console.log("Payment response data:", data);

        if (data.success || data.status === "success") {
          console.log("Payment successful");
          pushSystem(
            JSON.stringify({
              type: "payment_success",
              platform: selectedPlatform,
              booking_id:
                data.booking_id ||
                `${selectedPlatform.toUpperCase()}-${Math.random()
                  .toString(36)
                  .substr(2, 8)
                  .toUpperCase()}`,
              hotel_name: selectedHotel?.name || "Selected Hotel",
              amount: data.amount || selectedHotel?.price || "",
              upi_id: paymentParams.upi_id,
            })
          );
        } else {
          console.log("Payment failed");
          pushSystem(
            `Payment failed on ${selectedPlatform.toUpperCase()}. Please try again.`
          );
        }
      }

      setShowPaymentPopup(false);
      setPaymentParams({ upi_id: "", payment_method: "digital" });
      console.log("Payment popup closed");
    } catch (error) {
      console.error("Payment error:", error);
      pushSystem("Payment processing failed!");
    }

    setLoadingPayment(false);
    console.log("Payment completed");
  };

  // Render comparison results
  const renderComparisonResults = (results: PlatformResults[]) => {
    const totalHotels = results.reduce(
      (sum, r) => sum + (r.hotels?.length || 0),
      0
    );

    const { comparisonHotels, unmatchedHotels } =
      extractComparisonHotels(results);

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/20 to-red-900/20 p-6 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">
            Hotel Comparison Results
          </h3>
          <p className="text-gray-300">
            Found {totalHotels} hotels across {results.length} platforms
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Best Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-300">Price Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
              <span className="text-gray-300">Not Available</span>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        {comparisonHotels.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">
              Cross-Platform Hotel Comparison ({comparisonHotels.length} hotels)
            </h4>
            <p className="text-gray-400 text-sm">
              Hotels available on multiple platforms are compared below. Click
              on a price to book.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonHotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-2xl overflow-hidden border border-gray-800/50 hover:border-red-500/70 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <img
                      src={
                        hotel.agodaHotel?.image_url ||
                        hotel.oyoHotel?.imageurl ||
                        hotel.bookingHotel?.image_url ||
                        "/images/hotel-placeholder.jpg"
                      }
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/hotel-placeholder.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    </div>
                    {(hotel.agodaHotel?.rating_score ||
                      hotel.oyoHotel?.rating ||
                      hotel.bookingHotel?.rating) && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 px-3 py-1.5 rounded-full text-sm">
                        <span className="text-yellow-300">⭐</span>
                        <span className="text-white font-semibold">
                          {hotel.agodaHotel?.rating_score ||
                            hotel.oyoHotel?.rating ||
                            hotel.bookingHotel?.rating ||
                            "4.0"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hotel Content */}
                  <div className="p-5">
                    {/* Hotel Name */}
                    <h5 className="text-lg font-bold text-white mb-1 line-clamp-1">
                      {hotel.name}
                    </h5>

                    {/* Hotel Location (if available) */}
                    {(hotel.agodaHotel?.location ||
                      hotel.oyoHotel?.location ||
                      hotel.bookingHotel?.location) && (
                      <p className="text-sm text-gray-300 mb-4 flex items-center gap-1">
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
                        {hotel.agodaHotel?.location ||
                          hotel.oyoHotel?.location ||
                          hotel.bookingHotel?.location}
                      </p>
                    )}

                    {/* Platform Prices */}
                    <div className="space-y-3">
                      {/* Agoda Price */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          hotel.bestPrice.platform === "agoda" &&
                          hotel.agodaPrice !== "--"
                            ? "bg-gradient-to-r from-red-900/40 to-red-800/20 border-2 border-red-500/60 shadow-lg shadow-red-500/10"
                            : "bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-red-400/40 hover:bg-gray-800/40"
                        }`}
                        onClick={() =>
                          hotel.agodaHotel &&
                          handleBookHotel("agoda", hotel.agodaHotel)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              hotel.bestPrice.platform === "agoda" &&
                              hotel.agodaPrice !== "--"
                                ? "bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-500/30"
                                : "bg-gradient-to-br from-gray-700 to-gray-800"
                            }`}
                          >
                            <span className="text-xs font-bold text-white">
                              A
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-white text-sm">
                              Agoda
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              hotel.bestPrice.platform === "agoda" &&
                              hotel.agodaPrice !== "--"
                                ? "bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent"
                                : "text-white"
                            }`}
                          >
                            {hotel.agodaPrice}
                          </div>
                          {hotel.agodaPrice !== "--" && (
                            <div className="text-xs text-gray-300">Book</div>
                          )}
                        </div>
                      </div>

                      {/* OYO Price */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          hotel.bestPrice.platform === "oyo" &&
                          hotel.oyoPrice !== "--"
                            ? "bg-gradient-to-r from-red-900/40 to-red-800/20 border-2 border-red-500/60 shadow-lg shadow-red-500/10"
                            : "bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-red-400/40 hover:bg-gray-800/40"
                        }`}
                        onClick={() =>
                          hotel.oyoHotel &&
                          handleBookHotel("oyo", hotel.oyoHotel)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              hotel.bestPrice.platform === "oyo" &&
                              hotel.oyoPrice !== "--"
                                ? "bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-500/30"
                                : "bg-gradient-to-br from-gray-700 to-gray-800"
                            }`}
                          >
                            <span className="text-xs font-bold text-white">
                              O
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-white text-sm">
                              OYO
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              hotel.bestPrice.platform === "oyo" &&
                              hotel.oyoPrice !== "--"
                                ? "bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent"
                                : "text-white"
                            }`}
                          >
                            {hotel.oyoPrice}
                          </div>
                          {hotel.oyoPrice !== "--" && (
                            <div className="text-xs text-gray-300">Book</div>
                          )}
                        </div>
                      </div>

                      {/* Booking.com Price */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          hotel.bestPrice.platform === "booking" &&
                          hotel.bookingPrice !== "--"
                            ? "bg-gradient-to-r from-red-900/40 to-red-800/20 border-2 border-red-500/60 shadow-lg shadow-red-500/10"
                            : "bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-red-400/40 hover:bg-gray-800/40"
                        }`}
                        onClick={() =>
                          hotel.bookingHotel &&
                          handleBookHotel("booking", hotel.bookingHotel)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              hotel.bestPrice.platform === "booking" &&
                              hotel.bookingPrice !== "--"
                                ? "bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-500/30"
                                : "bg-gradient-to-br from-gray-700 to-gray-800"
                            }`}
                          >
                            <span className="text-xs font-bold text-white">
                              B
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-white text-sm">
                              Booking.com
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              hotel.bestPrice.platform === "booking" &&
                              hotel.bookingPrice !== "--"
                                ? "bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent"
                                : "text-white"
                            }`}
                          >
                            {hotel.bookingPrice}
                          </div>
                          {hotel.bookingPrice !== "--" && (
                            <div className="text-xs text-gray-300">Book</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Best Price Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-sm text-gray-300">
                            Best Deal
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              hotel.bestPrice.platform === "agoda"
                                ? "bg-gradient-to-r from-red-900/80 to-red-800/60 text-red-200"
                                : "bg-gradient-to-r from-red-900/80 to-red-800/60 text-red-200"
                            }`}
                          >
                            {hotel.bestPrice.platform.toUpperCase()}
                          </div>
                          <div className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                            {hotel.bestPrice.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform-Specific Hotels (Unmatched) */}
        <div className="space-y-8">
          <h4 className="text-xl font-bold text-white">
            Platform-Specific Hotels
          </h4>

          {/* Agoda Unmatched Hotels */}
          {unmatchedHotels.agoda.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold">A</span>
                </div>
                <div>
                  <h5 className="font-bold text-white">
                    Agoda Exclusive Hotels
                  </h5>
                  <p className="text-sm text-gray-400">
                    {unmatchedHotels.agoda.length} hotels
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unmatchedHotels.agoda.slice(0, 3).map((hotel, index) => (
                  <div
                    key={index}
                    className="bg-[#11121a] rounded-2xl p-4 border border-gray-800"
                  >
                    <h6 className="font-bold text-white mb-2 line-clamp-2">
                      {hotel.name}
                    </h6>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        {hotel.price || "--"}
                      </span>
                      <button
                        onClick={() => handleBookHotel("agoda", hotel)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {unmatchedHotels.agoda.length > 3 && (
                <p className="text-sm text-gray-400 text-center">
                  + {unmatchedHotels.agoda.length - 3} more Agoda hotels
                </p>
              )}
            </div>
          )}

          {/* OYO Unmatched Hotels */}
          {unmatchedHotels.oyo.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold">O</span>
                </div>
                <div>
                  <h5 className="font-bold text-white">OYO Exclusive Hotels</h5>
                  <p className="text-sm text-gray-400">
                    {unmatchedHotels.oyo.length} hotels
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unmatchedHotels.oyo.slice(0, 3).map((hotel, index) => (
                  <div
                    key={index}
                    className="bg-[#11121a] rounded-2xl p-4 border border-gray-800"
                  >
                    <h6 className="font-bold text-white mb-2 line-clamp-2">
                      {hotel.name}
                    </h6>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        {hotel.price || "--"}
                      </span>
                      <button
                        onClick={() => handleBookHotel("oyo", hotel)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {unmatchedHotels.oyo.length > 3 && (
                <p className="text-sm text-gray-400 text-center">
                  + {unmatchedHotels.oyo.length - 3} more OYO hotels
                </p>
              )}
            </div>
          )}

          {/* Booking.com Unmatched Hotels */}
          {unmatchedHotels.booking.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div>
                  <h5 className="font-bold text-white">
                    Booking.com Exclusive Hotels
                  </h5>
                  <p className="text-sm text-gray-400">
                    {unmatchedHotels.booking.length} hotels
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unmatchedHotels.booking.slice(0, 3).map((hotel, index) => (
                  <div
                    key={index}
                    className="bg-[#11121a] rounded-2xl p-4 border border-gray-800"
                  >
                    <h6 className="font-bold text-white mb-2 line-clamp-2">
                      {hotel.name}
                    </h6>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        {hotel.price || "--"}
                      </span>
                      <button
                        onClick={() => handleBookHotel("booking", hotel)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {unmatchedHotels.booking.length > 3 && (
                <p className="text-sm text-gray-400 text-center">
                  + {unmatchedHotels.booking.length - 3} more Booking.com hotels
                </p>
              )}
            </div>
          )}
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-gray-400">
            • Click on prices in the comparison section to book the hotel on
            that platform
          </p>
          <p className="text-sm text-gray-400 mt-1">
            • Green highlight indicates the best price among all platforms
          </p>
        </div>
      </div>
    );
  };

  // Render message content
  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "comparison_results") {
      content = renderComparisonResults(parsed.results);
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
                  Booking Request Submitted!
                </p>
                <p className="text-sm text-green-300 mt-1">
                  Your booking request for{" "}
                  <span className="font-semibold text-white">
                    {parsed.hotel_name}
                  </span>{" "}
                  has been submitted via {parsed.platform.toUpperCase()}.
                </p>
              </div>
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
                  Booking Confirmed & Paid!
                </p>
                <p className="text-sm text-blue-300 mt-1">
                  Your stay at{" "}
                  <span className="font-semibold text-white">
                    {parsed.hotel_name}
                  </span>{" "}
                  is confirmed.
                </p>
              </div>
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
              __html: line.replace(
                /\*\*(.*?)\*\*/g,
                "<strong class='text-white'>$1</strong>"
              ),
            }}
          />
        ));
      };

      content = (
        <div className="space-y-2">{renderFormatted(String(parsed))}</div>
      );
    }

    return typeof parsed === "object" &&
      parsed?.type === "comparison_results" ? (
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
              ? "bg-gray-900/80 text-gray-100 border-gray-800"
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

      {/* OYO LOGIN POPUP */}
      {showOyoLoginPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">OYO Login</h2>
              <p className="text-gray-400 text-sm mt-2">
                Enter your phone number
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={oyoPhone}
                  onChange={(e) => setOyoPhone(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <button
                onClick={handleOyoLogin}
                disabled={loadingOyoLogin}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingOyoLogin ? <PopupLoader /> : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OYO OTP POPUP */}
      {showOyoOtpPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-4">
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
                Enter OTP sent to {oyoPhone}
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
                  value={oyoOtp}
                  onChange={(e) => setOyoOtp(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none text-center text-2xl tracking-widest font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <button
                onClick={handleOyoOtpVerify}
                disabled={loadingOyoOtp}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingOyoOtp ? <PopupLoader /> : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING.COM LOGIN POPUP */}
      {showBookingLoginPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Booking.com Login
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Enter your email address
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
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <button
                onClick={handleBookingLogin}
                disabled={loadingBookingLogin}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingBookingLogin ? <PopupLoader /> : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING.COM OTP POPUP */}
      {showBookingOtpPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-sm border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-4">
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
                Enter OTP sent to {bookingEmail}
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
                  value={bookingOtp}
                  onChange={(e) => setBookingOtp(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none text-center text-2xl tracking-widest font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <button
                onClick={handleBookingOtpVerify}
                disabled={loadingBookingOtp}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingBookingOtp ? <PopupLoader /> : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING POPUP (Common for all platforms) */}
      {showBookingPopup && selectedHotel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-6 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
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
                    <p className="text-gray-400 text-sm">
                      Booking via {selectedPlatform?.toUpperCase()}
                    </p>
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
                        selectedHotel.image_url?.startsWith("//")
                          ? `https:${selectedHotel.image_url}`
                          : selectedHotel.image_url ||
                            selectedHotel.imageurl ||
                            "/images/hotel-placeholder.jpg"
                      }
                      alt={selectedHotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/hotel-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white line-clamp-2">
                      {selectedHotel.name}
                    </h3>
                    {selectedHotel.location && (
                      <p className="text-sm text-gray-300 line-clamp-1">
                        {selectedHotel.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-white">
                        {selectedHotel.price || "Price on request"}
                      </span>
                      {(selectedHotel.rating_score || selectedHotel.rating) && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-300">⭐</span>
                          <span className="text-sm text-gray-300">
                            {selectedHotel.rating_score || selectedHotel.rating}
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

                {selectedPlatform === "oyo" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="UPI ID"
                      value={oyoUpi}
                      onChange={(e) => setOyoUpi(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleFinalBooking}
                disabled={
                  loadingFinalBooking ||
                  !bookingParams.first_name ||
                  !bookingParams.last_name ||
                  !bookingParams.email ||
                  !bookingParams.phone_number
                }
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                {loadingFinalBooking ? (
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
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
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
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-red-500/20"
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

            <div className="px-3">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                onClick={() => {
                  setShowChat(false);
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
          </aside>

          {/* Chat Messages - FIXED: Remove left margin on mobile, add proper margin on desktop */}
          <div
            className={`overflow-y-auto px-4 py-6 space-y-4 ${
              sidebarOpen ? "md:ml-64" : "md:ml-0"
            }`}
          >
            {messages.map((m) => renderMessage(m))}
            {isLoading && <FlowerLoader />}
          </div>

          {/* Message Input - FIXED: Proper positioning */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 
                       bg-gradient-to-t from-black/80 via-black/40 to-transparent ${
                         sidebarOpen ? "md:left-64" : "md:left-0"
                       }`}
          >
            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    console.log("Enter key pressed, calling search...");
                    handleSearchAll();
                  }
                }}
                placeholder="Search hotels across Agoda, OYO & Booking.com..."
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                disabled={loadingSearch}
              />

              <button
                onClick={() => {
                  console.log("Search button clicked");
                  handleSearchAll();
                }}
                disabled={loadingSearch || !messageInput.trim()}
                className={`p-2.5 rounded-full ${
                  messageInput && !loadingSearch
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                    : "bg-white/20 hover:bg-white/30"
                } transition-all`}
              >
                {loadingSearch ? (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-screen bg-black text-white">
          {/* Sidebar */}
          <aside
            className={
              `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
              `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            }
          >
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

            <div className="px-3">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                onClick={() => {
                  setShowChat(true);
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
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col relative">
            {/* Top bar */}
            <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    L
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Content */}
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

                {/* Search Input */}
                <div className="w-full relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        console.log("↵ Enter key pressed");
                        setShowChat(true);
                        handleSearchAll();
                      }
                    }}
                    placeholder="e.g., hotels in Goa from 2jan to 5jan for 2 people and need 2 rooms"
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        console.log("🔍 Search button clicked from landing");
                        setShowChat(true);
                        handleSearchAll();
                      }}
                      disabled={!messageInput.trim()}
                      className={`p-2 ${
                        messageInput
                          ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                          : "bg-white/20 hover:bg-white/30"
                      } rounded-full transition-all`}
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

                {/* Platform Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-all">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Agoda</h3>
                    <p className="text-sm text-gray-400">
                      Global hotel booking with best prices
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-all">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">OYO</h3>
                    <p className="text-sm text-gray-400">
                      Budget hotels with great amenities
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-all">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Booking.com</h3>
                    <p className="text-sm text-gray-400">
                      Worldwide properties with instant booking
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
