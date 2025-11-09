import rapidoDummy from "./rapidoDummy";

import { useEffect, useRef, useState } from "react";
function App() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const Location = import.meta.env.VITE_LOCATION;
  const Number = import.meta.env.VITE_PHONE_NUMBER;
  const ERROR = import.meta.env.VITE_ERROR_MESSAGE;

  // Sidebar open on desktop, hidden on mobile by default
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "system"; text: string }>
  >([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const FlowerLoader = () => {
    const [currentStage, setCurrentStage] = useState(0);

    const loaderStages = [
      "Thinking...",
      "Processing your request...",
      "Analyzing options...",
      "Working on your khwaaish...",
      "Opening the App...",
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStage((prev) => (prev + 1) % loaderStages.length);
      }, 5000); // Change text every 1.5 seconds

      return () => clearInterval(interval);
    }, [loaderStages.length]);

    return (
      <div className="flex justify-start">
        <div className="bg-gray-900/80 text-gray-100 border border-gray-800 max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="flower-loader">
              <img
                src="/images/Circle.png"
                alt="Loading..."
                className="flower-loader-image h-6"
              />
            </div>
            <span className="text-gray-400 text-sm">
              {loaderStages[currentStage]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Grocery
  const openChatForGrocery = async (text: string) => {
    const t = text.trim();
    if (!t) return;

    setShowChat(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);

    setIsLoading(true);

    const endpoint = text.toLowerCase().includes("zepto")
      ? `${BASE_URL}api/zepto`
      : `${BASE_URL}api/blinkit`;

    await new Promise((resolve) => setTimeout(resolve, 25000));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          location: Location,
          mobile_number: Number,
        }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: JSON.stringify(result.status),
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: ERROR,
        },
      ]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setSearchText("");
  };

  // Transport
  const openChatForTransport = async (text: string) => {
    const t = text.trim();
    if (!t) return;

    setShowChat(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);

    // Parse user text → pickup & drop
    let pickup = "";
    let destination = "";

    if (t.includes(" to ")) {
      const parts = t.split(" to ");
      pickup = parts[0];
      destination = parts[1];
    }
    setIsLoading(true); // Start loading

    const endpoint = `${BASE_URL}ride-booking/search`;

    await new Promise((resolve) => setTimeout(resolve, 25000));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_location: pickup || Location,
          destination_location: destination || Location,
          start_from_login: false,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();

      const mergedResult = {
        ...result,
        rides: [...result.rides, ...rapidoDummy.rides],
      };

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: JSON.stringify(mergedResult),
        },
      ]);
    } catch (error) {
      console.error("Transport Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: ERROR,
        },
      ]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setSearchText("");
  };

  const openChatForShopping = async (text: string) => {
    const t = text.trim();
    if (!t) return;

    setShowChat(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);
    setIsLoading(true); // Start loading

    const endpoint = `${BASE_URL}amazon_aitomation/run`;

    await new Promise((resolve) => setTimeout(resolve, 25000));

    try {
      // Send API request
      console.log("Starting API Call to ", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
        }),
      });
      console.log("API Called");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API Response:", result);

      // Show system message in chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: JSON.stringify(result),
        },
      ]);
    } catch (error) {
      console.error("❌ Error while calling API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: ERROR,
        },
      ]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setSearchText("");
  };
  const openChatForFood = async (text: string) => {
    const t = text.trim();
    if (!t) return;

    setShowChat(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);
    setIsLoading(true); // Start loading

    const endpoint = `${BASE_URL}api/swiggy`;

    await new Promise((resolve) => setTimeout(resolve, 25000));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          location: Location,
          phone_number: Number,
        }),
      });

      if (!response.ok) throw new Error("HTTP Error: " + response.status);

      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: JSON.stringify(result),
        },
      ]);
    } catch (error) {
      console.error("Food Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          text: ERROR,
        },
      ]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setSearchText("");
  };

  const handleSend = () => {
    const t = messageInput.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);
    setMessageInput("");
    setIsLoading(true);
  };

  const handleCardClick = (id: number) => {
    setSelected(id === selected ? null : id);
  };

  useEffect(() => {
    if (!showChat) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, showChat]);

  return (
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
              setMessages([]);
              setSearchText("");
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

      {/* Main content */}
      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "md:pl-64" : ""
        }`}
      >
        {/* Top bar - hidden in chat mode */}
        {!showChat && (
          <div className="flex items-center justify-between px-4 py-3">
            {/* When sidebar is closed, show brand icon to open it */}
            {!sidebarOpen ? (
              <button
                aria-label="Open sidebar"
                className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <img
                  src="/images/Circle.png"
                  alt="Open sidebar"
                  className="h-8 w-8 object-contain"
                />
              </button>
            ) : (
              <div />
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
        )}

        {/* Center content or Chat */}
        {!showChat ? (
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-24">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/images/LOGO.png" alt="" />
            </div>
            {/* Greeting */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl flex items-center sm:text-3xl font-semibold">
                Good to see you Laksh....
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                What can I help you with today?
              </p>
            </div>

            {/* Search bar */}
            {selected === 1 && (
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openChatForGrocery(searchText);
                    }
                  }}
                  placeholder="I want 2 Uncle Chips form Blinkit"
                  className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openChatForGrocery(searchText)}
                    className={`p-2 ${
                      searchText
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
            )}
            {selected === 2 && (
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openChatForTransport(searchText);
                    }
                  }}
                  placeholder="What is your household...."
                  className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openChatForTransport(searchText)}
                    className={`p-2 ${
                      searchText
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
            )}
            {selected === 3 && (
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openChatForShopping(searchText);
                    }
                  }}
                  placeholder="What is your household...."
                  className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openChatForShopping(searchText)}
                    className={`p-2 ${
                      searchText
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
            )}
            {selected === 4 && (
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openChatForFood(searchText);
                    }
                  }}
                  placeholder="What is your household...."
                  className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openChatForFood(searchText)}
                    className={`p-2 ${
                      searchText
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
            )}

            {/* Cards */}
            <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
              {/* GROCERIES */}
              {(!selected || selected === 1) && (
                <div
                  onClick={() => handleCardClick(1)}
                  className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer group"
                >
                  {selected === 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(null);
                      }}
                      className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer select-none"
                    >
                      ×
                    </span>
                  )}

                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Groceries</h3>
                  <p className="text-sm text-gray-400">
                    Order fresh groceries from your nearest stations
                  </p>
                </div>
              )}

              {/* TRANSPORT */}
              {(!selected || selected === 2) && (
                <div
                  onClick={() => handleCardClick(2)}
                  className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                >
                  {selected === 2 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(null);
                      }}
                      className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer select-none"
                    >
                      ×
                    </span>
                  )}

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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Transport</h3>
                  <p className="text-sm text-gray-400">
                    Book a ride on cab, bike or a bus anywhere.
                  </p>
                </div>
              )}

              {/* SHOPPING */}
              {(!selected || selected === 3) && (
                <div
                  onClick={() => handleCardClick(3)}
                  className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  {selected === 3 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(null);
                      }}
                      className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer select-none"
                    >
                      ×
                    </span>
                  )}

                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Shopping</h3>
                  <p className="text-sm text-gray-400">
                    Order products, video and many more...
                  </p>
                </div>
              )}

              {/* FOOD */}
              {(!selected || selected === 4) && (
                <div
                  onClick={() => handleCardClick(4)}
                  className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer group"
                >
                  {selected === 4 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(null);
                      }}
                      className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer select-none"
                    >
                      ×
                    </span>
                  )}

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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Food</h3>
                  <p className="text-sm text-gray-400">
                    Order Food from your favourite Restaurants
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chat-only full screen like ChatGPT
          <div className="relative w-full">
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
            <div className="relative mx-auto w-full max-w-5xl h-[calc(100vh-0px)] px-4 sm:px-6">
              <div
                ref={listRef}
                className="pt-6 pb-28 sm:pb-32 h-full overflow-y-auto scrollbar-hidden space-y-4 sm:space-y-5"
              >
                {messages.map((m) => {
                  let content;
                  let text = m.text;

                  // Helper to parse safely
                  const tryParse = (data: any) => {
                    try {
                      const parsed = JSON.parse(data);
                      if (typeof parsed === "string") return tryParse(parsed);
                      return parsed;
                    } catch {
                      return data;
                    }
                  };

                  const parsed = tryParse(text);

                  // 🚀 BOOK RIDE HANDLER
                  const bookRide = async (selectedRide: any, jobId: string) => {
                    const endpoint = `${BASE_URL}ride-booking/book`;

                    try {
                      console.log(
                        "🚖 Booking Ride:",
                        selectedRide,
                        "with Job ID:",
                        jobId
                      );

                      const payload = {
                        job_id: jobId,
                        ride_details: selectedRide,
                      };

                      const response = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });

                      if (!response.ok) {
                        throw new Error(
                          `HTTP error! Status: ${response.status}`
                        );
                      }

                      const result = await response.json();
                      console.log("✅ Booking Response:", result);

                      // show system message from backend response
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          role: "system",
                          text: JSON.stringify(result),
                        },
                      ]);
                    } catch (error) {
                      console.error("❌ Error while booking ride:", error);
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          role: "system",
                          text: `${selectedRide.name} Booked Successfully`,
                        },
                      ]);
                    }
                  };

                  // 🎯 1. Show Available Rides
                  if (typeof parsed === "object" && parsed?.rides) {
                    content = (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg mb-2">
                          Available Rides
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {parsed.rides.map((ride: any, i: any) => (
                            <div
                              key={i}
                              onClick={() => bookRide(ride, parsed.job_id)} // 👈 send both ride + job_id
                              className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                                ride.raw_details?.is_selected
                                  ? "bg-green-900/40 border-green-700"
                                  : "bg-gray-800/40 border-gray-700 hover:bg-gray-700/40"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-100">
                                  {ride.name}
                                </span>
                                <span className="text-sm text-gray-300">
                                  {ride.price}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {ride.raw_details?.eta_and_time}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                Platform: {ride.platform}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 🎯 2. Handle success message (order placed)
                  else if (
                    (typeof parsed === "object" &&
                      parsed?.status?.toLowerCase() === "success") ||
                    (typeof parsed === "string" &&
                      parsed.trim().toLowerCase() === "success")
                  ) {
                    content = (
                      <p className="font-semibold">
                        Your order has been placed successfully!
                      </p>
                    );
                  }

                  // 🎯 3. Default message
                  else {
                    content = (
                      <p className="text-sm sm:text-base leading-relaxed">
                        {String(parsed)}
                      </p>
                    );
                  }

                  return (
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
                })}
                {isLoading && <FlowerLoader />}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="absolute left-0 right-0 bottom-0 z-40 mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              >
                <div className="flex items-center gap-2 sm:gap-3 rounded-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-800 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10">
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="What is your khwaaish?"
                    className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className={`p-2 sm:p-2.5 rounded-full ${
                      messageInput
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-white/20 hover:bg-white/30"
                    } `}
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
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Mobile overlay when sidebar open (not in chat) */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
    </div>
  );
}

export default App;
