import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import {
  mockAgodaResponse,
  mockOyoResponse,
  mockBookingResponse,
} from "./mockData";
import ComparisonResults from "./ComparisonResults";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const BaseURL = import.meta.env.VITE_API_BASE_URL || "";
const USE_MOCK_DATA = true; // switch to false for real APIs

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

// Hotel Interfaces for different platforms
export interface AgodaHotel {
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
  cancellation_policy?: string;
}

export interface OyoHotel {
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

export interface BookingHotel {
  name: string;
  url?: string;
  image_url?: string;
  rating?: string;
  location?: string;
  price?: string;
  cancellation_policy?: string;
}

export interface ExtractedData {
  destination: string;
  check_in?: string;
  check_out?: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface PlatformResults {
  platform: "agoda" | "oyo" | "booking";
  status: "loading" | "success" | "error";
  data: any;
  hotels: any[];
  extractedData?: ExtractedData;
  sessionId?: string;
}

export interface ComparisonHotel {
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

// BaseURL removed as we are using mock data
// const BaseURL = import.meta.env.VITE_API_BASE_URL || "";

export default function HotelsComparison() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [agodaSessionId, setAgodaSessionId] = useState("default");
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);

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
  const [oyoUpi, setOyoUpi] = useState("");

  // Booking.com states
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingOtp, setBookingOtp] = useState("");

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

  const isApiSuccess = (res: any) =>
    res?.success === true ||
    res?.status === "ok" ||
    res?.status === "booking_confirmed";

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
    hotelMap.forEach((hotelData) => {
      const agodaPrice = hotelData.agoda?.price || "--";
      const oyoPrice = hotelData.oyo?.price || "--";
      const bookingPrice = hotelData.booking?.price || "--";

      // Find best price
      const prices = [
        { platform: "agoda" as const, price: agodaPrice },
        { platform: "oyo" as const, price: oyoPrice },
        { platform: "booking" as const, price: bookingPrice },
      ].filter((p) => p.price !== "--");

      let bestPrice: { platform: "agoda" | "oyo" | "booking"; price: string } =
        {
          platform: "agoda",
          price: "--",
        };
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
    if (!messageInput.trim()) return;

    const userMessage = messageInput.trim();

    pushUser(userMessage);
    setMessageInput("");
    setShowChat(true);
    setIsLoading(true);
    setLoadingSearch(true);

    setPlatformResults([
      { platform: "agoda", status: "loading", data: null, hotels: [] },
      { platform: "oyo", status: "loading", data: null, hotels: [] },
      { platform: "booking", status: "loading", data: null, hotels: [] },
    ]);

    try {
      // Optional mock delay
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      const [agodaRes, oyoRes, bookingRes] = await Promise.allSettled([
        USE_MOCK_DATA
          ? Promise.resolve(mockAgodaResponse)
          : fetch(`${BaseURL}/api/agoda/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: userMessage,
                session_id: agodaSessionId,
              }),
            }).then((r) => r.json()),

        USE_MOCK_DATA
          ? Promise.resolve(mockOyoResponse)
          : fetch(`${BaseURL}/oyo_automation/oyo/search/natural`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: userMessage }),
            }).then((r) => r.json()),

        USE_MOCK_DATA
          ? Promise.resolve(mockBookingResponse)
          : fetch(`${BaseURL}/api/booking/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: userMessage }),
            }).then((r) => r.json()),
      ]);

      const results: PlatformResults[] = [];

      //  AGODA ----------
      if (agodaRes.status === "fulfilled") {
        const agodaData = agodaRes.value;
        if (agodaData.search_results?.session_id) {
          setAgodaSessionId(agodaData.search_results.session_id);
        }

        results.push({
          platform: "agoda",
          status: "success",
          data: agodaData,
          hotels: agodaData.search_results?.results ?? [],
          extractedData: agodaData.extracted_data,
          sessionId: agodaData.search_results?.session_id,
        });
      } else {
        results.push({
          platform: "agoda",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      //  OYO ----------
      if (oyoRes.status === "fulfilled") {
        const oyoData = oyoRes.value;
        results.push({
          platform: "oyo",
          status: "success",
          data: oyoData,
          hotels: oyoData.hotels ?? [],
          extractedData: {
            destination:
              userMessage.match(/in\s+([^,\s]+)/)?.[1] || "Destination",
            adults: 2,
            children: 0,
            rooms: 1,
          },
        });
      } else {
        results.push({
          platform: "oyo",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      //  BOOKING ----------
      if (bookingRes.status === "fulfilled") {
        const bookingData = bookingRes.value;

        const session =
          bookingData.search_results?.session_id || bookingData.session_id;

        if (session) {
          setBookingSessionId(session);
        }

        results.push({
          platform: "booking",
          status: "success",
          data: bookingData,
          hotels: bookingData.search_results?.results ?? [],
          extractedData: bookingData.extracted_data,
          sessionId: session,
        });
      } else {
        results.push({
          platform: "booking",
          status: "error",
          data: null,
          hotels: [],
        });
      }

      setPlatformResults(results);

      pushSystem(
        JSON.stringify({
          type: "comparison_results",
          query: userMessage,
          results,
        })
      );
    } catch (err) {
      console.error("Search error:", err);
      pushSystem("Something went wrong while searching. Please try again.");
    } finally {
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
        await handleOyoLoginWithAutoCheck();
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
  const handleOyoLoginWithAutoCheck = async () => {
    console.log("OYO login with auto-check called (MOCK)");

    if (!oyoPhone.trim()) {
      console.log("No phone number, showing login popup");
      setShowOyoLoginPopup(true);
      return;
    }

    setLoadingOyoLogin(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate OTP sent
    console.log("OYO login successful, showing OTP popup");
    setShowOyoLoginPopup(false);
    setShowOyoOtpPopup(true);

    setLoadingOyoLogin(false);
  };

  // OYO Login (regular)
  const handleOyoLogin = async () => {
    if (!oyoPhone.trim()) {
      alert("Please enter phone number");
      return;
    }

    setLoadingOyoLogin(true);

    try {
      let responseData: any;

      if (USE_MOCK_DATA) {
        console.log("OYO Login called (MOCK)");
        await new Promise((r) => setTimeout(r, 1000));

        responseData = {
          status: "otp_sent",
          message: "OTP sent successfully",
        };
      } else {
        const response = await fetch(
          `${BaseURL}/oyo_automation/oyo/login/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: oyoPhone }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        responseData = await response.json();
      }

      /**
       * IMPORTANT:
       * Backend may return:
       * - status: "ok"
       * - status: "otp_sent"
       * - success: true
       */
      const isLoginSuccess =
        responseData?.success === true ||
        responseData?.status === "ok" ||
        responseData?.status === "otp_sent";

      if (!isLoginSuccess) {
        throw new Error(
          responseData?.message || "Failed to send OTP. Please try again."
        );
      }

      console.log("OYO login successful, showing OTP popup");

      setShowOyoLoginPopup(false);
      setShowOyoOtpPopup(true);
    } catch (error) {
      console.error("OYO Login error:", error);
      alert("Unable to send OTP. Please try again.");
    } finally {
      setLoadingOyoLogin(false);
    }
  };

  // OYO OTP Verification
  const handleOyoOtpVerify = async () => {
    if (!oyoOtp?.trim()) {
      alert("Please enter OTP");
      return;
    }

    setLoadingOyoOtp(true);

    try {
      let responseData: any;

      if (USE_MOCK_DATA) {
        console.log("OYO OTP Verification called (MOCK)");
        await new Promise((r) => setTimeout(r, 1000));

        responseData = {
          status: "ok",
          message: "OTP verified successfully",
        };
      } else {
        const response = await fetch(
          `${BaseURL}/oyo_automation/oyo/login/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: oyoPhone,
              otp: oyoOtp,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        responseData = await response.json();
      }

      /**
       * Backend may return:
       * - status: "ok"
       * - success: true
       */
      const isOtpVerified =
        responseData?.success === true || responseData?.status === "ok";

      if (!isOtpVerified) {
        throw new Error(
          responseData?.message || "Invalid OTP. Please try again."
        );
      }

      console.log("OYO OTP verification successful");

      setShowOyoOtpPopup(false);
      setShowBookingPopup(true);
    } catch (error) {
      console.error("OYO OTP verification error:", error);
      alert("OTP verification failed. Please try again.");
    } finally {
      setLoadingOyoOtp(false);
    }
  };

  // Booking.com Login
  const handleBookingLogin = async () => {
    console.log("Booking.com Login called (MOCK)");
    if (!bookingEmail.trim() || !bookingEmail.includes("@")) {
      alert("Please enter valid email");
      return;
    }
    setLoadingBookingLogin(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setShowBookingLoginPopup(false);
    setShowBookingOtpPopup(true);
    setLoadingBookingLogin(false);
  };

  // Booking.com OTP Verification
  const handleBookingOtpVerify = async () => {
    console.log("Booking.com OTP Verification called (MOCK)");
    setLoadingBookingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setShowBookingOtpPopup(false);
    setShowBookingPopup(true);
    setLoadingBookingOtp(false);
  };

  // Final Booking (common for all platforms)
  const handleFinalBooking = async () => {
    if (!selectedHotel || !selectedPlatform) {
      alert("Please select a hotel first");
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

    // EXTRA validation only for OYO
    if (selectedPlatform === "oyo" && !oyoUpi.trim()) {
      alert("Please enter UPI ID for OYO booking");
      return;
    }

    setLoadingFinalBooking(true);

    try {
      let responseData: any;

      // OYO REAL BOOKING --------
      if (selectedPlatform === "oyo") {
        if (USE_MOCK_DATA) {
          console.log("OYO Booking called (MOCK)");
          await new Promise((r) => setTimeout(r, 1500));

          responseData = {
            status: "booking_confirmed",
            booking_id: "OYO-MOCK-" + Date.now(),
          };
        } else {
          const response = await fetch(`${BaseURL}/oyo_automation/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_number: bookingParams.phone_number,
              hotel_url: selectedHotel.hotel_url,
              name: `${bookingParams.first_name} ${bookingParams.last_name}`,
              email: bookingParams.email,
              pay_mode: "pay_now",
              upi_id: oyoUpi,
              headless: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          responseData = await response.json();
        }

        if (!isApiSuccess(responseData)) {
          throw new Error(responseData?.message || "OYO booking failed");
        }

        // SUCCESS
        pushSystem(
          JSON.stringify({
            type: "booking_confirmation",
            platform: "oyo",
            hotel_name: selectedHotel.name,
            guest_name: `${bookingParams.first_name} ${bookingParams.last_name}`,
            email: bookingParams.email,
            phone: bookingParams.phone_number,
            booking_id: responseData.booking_id || "OYO-CONFIRMED",
          })
        );

        setShowBookingPopup(false);
        setShowPaymentPopup(true);
        return; // IMPORTANT: stop here
      }

      // Agoda REAL BOOKING --------
      if (selectedPlatform === "agoda") {
        try {
          let responseData: any;

          if (USE_MOCK_DATA) {
            console.log("Agoda Booking called (MOCK)");
            await new Promise((r) => setTimeout(r, 1200));

            responseData = {
              status: "ok",
              booking_id: "AGODA-MOCK-" + Date.now(),
            };
          } else {
            const response = await fetch(`${BaseURL}/api/agoda/book`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: agodaSessionId,
                hotel_url: selectedHotel.url,
                first_name: bookingParams.first_name,
                last_name: bookingParams.last_name,
                email: bookingParams.email,
                phone_number: bookingParams.phone_number,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
            }

            responseData = await response.json();
          }

          if (!isApiSuccess(responseData)) {
            throw new Error(responseData?.message || "Agoda booking failed");
          }

          // Move to payment popup
          setShowBookingPopup(false);
          setShowPaymentPopup(true);
          return;
        } catch (err) {
          console.error("Agoda booking error:", err);
          alert("Agoda booking failed. Please try again.");
          setLoadingFinalBooking(false);
          return;
        }
      }

      // BOOKING.COM REAL BOOKING --------
      if (selectedPlatform === "booking") {
        try {
          let responseData: any;

          if (!bookingSessionId) {
            alert("Booking session expired. Please search again.");
            setLoadingFinalBooking(false);
            return;
          }

          if (USE_MOCK_DATA) {
            console.log("Booking.com Booking called (MOCK)");
            await new Promise((r) => setTimeout(r, 1200));

            responseData = {
              status: "ok",
              booking_id: "BOOKING-MOCK-" + Date.now(),
            };
          } else {
            const response = await fetch(`${BaseURL}/api/booking/book`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: bookingSessionId,
                property_url: selectedHotel.url,
                first_name: bookingParams.first_name,
                last_name: bookingParams.last_name,
                email: bookingParams.email,
                phone_number: bookingParams.phone_number,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
            }

            responseData = await response.json();
          }

          if (!isApiSuccess(responseData)) {
            throw new Error(
              responseData?.message || "Booking.com booking failed"
            );
          }

          // SUCCESS → directly confirm booking
          pushSystem(
            JSON.stringify({
              type: "booking_confirmation",
              platform: "booking",
              hotel_name: selectedHotel.name,
              guest_name: `${bookingParams.first_name} ${bookingParams.last_name}`,
              email: bookingParams.email,
              phone: bookingParams.phone_number,
              booking_id: responseData.booking_id || "BOOKING-CONFIRMED",
            })
          );

          setShowBookingPopup(false);
          setLoadingFinalBooking(false);
          return;
        } catch (err) {
          console.error("Booking.com booking error:", err);
          alert("Booking.com booking failed. Please try again.");
          setLoadingFinalBooking(false);
          return;
        }
      }

      // OTHER PLATFORMS (MOCK)

      await new Promise((r) => setTimeout(r, 1500));

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
      setShowPaymentPopup(true);
    } catch (error) {
      console.error("Final booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoadingFinalBooking(false);
    }
  };

  // Payment
  const handlePayment = async () => {
    if (selectedPlatform === "agoda") {
      try {
        let responseData: any;

        if (!paymentParams.upi_id.trim()) {
          alert("Please enter UPI ID");
          return;
        }
        setLoadingPayment(true);

        if (USE_MOCK_DATA) {
          console.log("Agoda Payment called (MOCK)");
          await new Promise((r) => setTimeout(r, 1200));

          responseData = {
            status: "ok",
            payment_id: "AGODA-PAY-" + Date.now(),
          };
        } else {
          const response = await fetch(`${BaseURL}/api/agoda/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: agodaSessionId,
              payment_method: "digital",
              card_number: "",
              card_holder_name: "",
              expiry_date: "",
              cvc: "",
              upi_id: paymentParams.upi_id,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          responseData = await response.json();
        }

        if (!isApiSuccess(responseData)) {
          throw new Error(responseData?.message || "Payment failed");
        }

        pushSystem(
          JSON.stringify({
            type: "payment_success",
            platform: "agoda",
            hotel_name: selectedHotel?.name,
            amount: selectedHotel?.price,
            upi_id: paymentParams.upi_id,
          })
        );

        setShowPaymentPopup(false);
        setPaymentParams({ upi_id: "", payment_method: "digital" });
        return;
      } catch (err) {
        console.error("Agoda payment error:", err);
        alert("Payment failed. Please try again.");
        setLoadingPayment(false);
        return;
      } finally {
        setLoadingPayment(false);
      }
    }

    console.log("Payment called (MOCK)");

    if (!paymentParams.upi_id) {
      console.log("No UPI ID provided");
      alert("Please enter UPI ID");
      return;
    }

    setLoadingPayment(true);
    console.log("Starting payment process (MOCK)...");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Payment successful");
    pushSystem(
      JSON.stringify({
        type: "payment_success",
        platform: selectedPlatform,
        booking_id:
          "MOCK-BOOKING-" +
          Math.random().toString(36).substr(2, 8).toUpperCase(),
        hotel_name: selectedHotel?.name || "Selected Hotel",
        amount: selectedHotel?.price || "",
        upi_id: paymentParams.upi_id,
      })
    );

    setShowPaymentPopup(false);
    setPaymentParams({ upi_id: "", payment_method: "digital" });
    console.log("Payment popup closed");

    setLoadingPayment(false);
    console.log("Payment completed");
  };

  // Render comparison results
  const renderComparisonResults = (results: PlatformResults[]) => {
    const { comparisonHotels, unmatchedHotels } =
      extractComparisonHotels(results);

    return (
      <ComparisonResults
        comparisonHotels={comparisonHotels}
        unmatchedHotels={unmatchedHotels}
        onBook={handleBookHotel}
      />
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
                    <VoiceRecorderButton
                      onTextReady={(text) => {
                        setMessageInput(text);
                      }}
                    />
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
