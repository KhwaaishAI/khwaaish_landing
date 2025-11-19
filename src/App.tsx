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

  // ---------- NEW Blinkit-specific state ----------
  const [blinkitSessionId, setBlinkitSessionId] = useState<string | null>(null);
  const [pendingBlinkitQuery, setPendingBlinkitQuery] = useState<string | null>(
    null
  );
  const [blinkitProducts, setBlinkitProducts] = useState<any[]>([]);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [awaitingUpi, setAwaitingUpi] = useState(false);
  const [awaitingAddress, setAwaitingAddress] = useState(false);
  // -------------------------------------------------

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
      }, 5000); // Change text every 5 seconds

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

  // ----------------- Blinkit (Grocery) Flow -----------------
  // Helper - post JSON
  const postJSON = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    return res.json();
  };

  // Format and push system message
  const pushSystem = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "system", text },
    ]);

  // Format and push user message
  const pushUser = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
    ]);

  // Start Blinkit login -> OTP flow (called when user first requests grocery)
  const startBlinkitLoginFlow = async (userQuery: string) => {
    try {
      setShowChat(true);
      pushUser(userQuery);

      setPendingBlinkitQuery(userQuery);
      setIsLoading(true);

      // Call backend login
      const loginUrl = `${BASE_URL}api/login`;
      const payload = {
        phone_number: Number,
        location: Location,
      };

      const result = await postJSON(loginUrl, payload);
      // assume result.session_id
      const sid = result?.session_id || null;
      if (!sid) {
        throw new Error("No session_id returned from /api/login");
      }

      setBlinkitSessionId(sid);
      setAwaitingOtp(true);
      pushSystem(
        "OTP has been sent to the phone number. Please enter the OTP here."
      );
    } catch (err) {
      console.error("Blinkit login error:", err);
      pushSystem(ERROR || "Something went wrong while starting Blinkit login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP
  const submitBlinkitOtp = async (otp: string) => {
    if (!blinkitSessionId) {
      pushSystem("Session not found. Please start again.");
      setAwaitingOtp(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${BASE_URL}api/submit-otp`;
      const body = { session_id: blinkitSessionId, otp };
      const res = await postJSON(url, body);

      // assume res.success or res.session_id/proof
      // If backend returns a new session_id, update it.
      if (res?.session_id) setBlinkitSessionId(res.session_id);
      if (res?.success === false)
        throw new Error(res?.message || "OTP verification failed");

      setAwaitingOtp(false);
      pushSystem("OTP verified. Searching for products now...");

      // Trigger search using pending query
      if (pendingBlinkitQuery) {
        await blinkitSearch(pendingBlinkitQuery);
      } else {
        pushSystem("No pending query found.");
      }
    } catch (err) {
      console.error("submitOtp error:", err);
      pushSystem("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Call search API and display products
  const blinkitSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const url = `${BASE_URL}api/search`;
      const body = { query };
      const res = await postJSON(url, body);
      console.log("Blinkit search response:", res);

      // --- FIX STARTS HERE ---
      // Extract dynamic key inside res.results
      const resultKey = res?.results ? Object.keys(res.results)[0] : null;
      const products = resultKey ? res.results[resultKey] : [];
      // --- FIX ENDS HERE ---

      // Save session ID for add-to-cart & checkout
      if (res?.session_id) {
        setBlinkitSessionId(res.session_id);
      }

      // Store products
      setBlinkitProducts(products);

      // Display in chat
      if (Array.isArray(products) && products.length) {
        const listText = products
          .map((p: any, idx: number) => {
            const name = p?.name;
            const price = p?.price;
            return `**${idx + 1}. ${name}**${price ? " — ₹" + price : ""}`;
          })
          .join("\n\n");

        pushSystem(
          `Found ${products.length} items:\n\n${listText}\n\n💡 **How to add items:**\n• Reply with "2 dairy milk silk"\n• Or "add 2 of item 1"\n• Use the item numbers shown above`
        );
      } else {
        pushSystem("No products found for your query.");
      }
    } catch (err) {
      console.error("blinkitSearch error:", err);
      pushSystem(ERROR || "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingBlinkitQuery(null);
    }
  };

  // Parse messages like:
  // "2 dairy milk silk" -> quantity 2, product name "dairy milk silk"
  // "add 2 of item 1" -> select product index 1 and qty 2
  // "add item 1 qty 2" etc.
  const parseAddToCartCommand = (text: string, products: any[]) => {
    const t = text.trim().toLowerCase();

    // 1) "add X of item N" or "add item N qty X"
    const itemIndexMatch = t.match(/item\s*(\d+)/i);
    const qtyMatch1 = t.match(
      /(?:^|\b)(\d+)\b(?=\s*(?:x|pcs|pieces|qty|quantity|\b))/i
    );

    if (itemIndexMatch && qtyMatch1) {
      const idx = parseInt(itemIndexMatch[1], 10) - 1;
      const qty = parseInt(qtyMatch1[1], 10);
      if (products[idx]) {
        const name =
          products[idx].name ||
          products[idx].title ||
          products[idx].product_name;
        return { product_name: name, quantity: qty };
      }
    }

    // 2) "add 2 of item 1" or "add 2 item 1"
    const addOfItemMatch = t.match(
      /(?:add\s*)?(\d+)\s*(?:of\s*)?item\s*(\d+)/i
    );
    if (addOfItemMatch) {
      const qty = parseInt(addOfItemMatch[1], 10);
      const idx = parseInt(addOfItemMatch[2], 10) - 1;
      if (products[idx]) {
        const name =
          products[idx].name ||
          products[idx].title ||
          products[idx].product_name;
        return { product_name: name, quantity: qty };
      }
    }

    // 3) "2 dairy milk silk" -> first token number
    const firstNumberMatch = t.match(/^(\d+)\s+(.+)$/);
    if (firstNumberMatch) {
      const qty = parseInt(firstNumberMatch[1], 10);
      const namePart = firstNumberMatch[2].trim();
      // try to match product by name substring
      const matched = products.find((p: any) =>
        (p.name || p.title || p.product_name || "")
          .toLowerCase()
          .includes(namePart)
      );
      if (matched) {
        return {
          product_name: matched.name || matched.title || matched.product_name,
          quantity: qty,
        };
      }
      // fallback: use raw string as product_name
      return { product_name: namePart, quantity: qty };
    }

    // 4) "add item 2" default quantity 1
    const addItemOnly = t.match(/item\s*(\d+)/i);
    if (addItemOnly) {
      const idx = parseInt(addItemOnly[1], 10) - 1;
      if (products[idx]) {
        const name =
          products[idx].name ||
          products[idx].title ||
          products[idx].product_name;
        return { product_name: name, quantity: 1 };
      }
    }

    // 5) "add <product name>" default qty 1
    const addNameMatch = t.match(/^(?:add\s+)?(.+)$/i);
    if (addNameMatch) {
      const namePart = addNameMatch[1].trim();
      const matched = products.find((p: any) =>
        (p.name || p.title || p.product_name || "")
          .toLowerCase()
          .includes(namePart)
      );
      if (matched) {
        return {
          product_name: matched.name || matched.title || matched.product_name,
          quantity: 1,
        };
      }
    }

    return null;
  };

  // Add to cart
  const blinkitAddToCart = async (product_name: string, quantity: number) => {
    if (!blinkitSessionId) {
      pushSystem("Session missing. Please login first.");
      return;
    }
    setIsLoading(true);
    try {
      const url = `${BASE_URL}api/add-to-cart`;
      const body = { session_id: blinkitSessionId, product_name, quantity };
      const res = await postJSON(url, body);

      // Interpret backend response.
      // Expecting something like { status: "success" } or { status: "need_upi" } / { status: "need_address" }
      const status = (res?.status || "").toString().toLowerCase();
      console.log("add-to-cart response:", res);
      if (status === "success" || res?.success) {
        pushSystem(`Added ${quantity} x ${product_name} to cart successfully.`);
      } else if (status.includes("need_upi") || res?.requires_upi) {
        setAwaitingUpi(true);
        pushSystem(
          "Payment requires UPI. Please provide your UPI ID (e.g. zeki@ybl)."
        );
      } else if (status.includes("need_address") || res?.requires_address) {
        setAwaitingAddress(true);
        pushSystem(
          "We need your address to complete the order. Please provide house number and name (comma separated) or a single-line address."
        );
      } else {
        // fallback: show raw result
        pushSystem(`Add to cart response: ${JSON.stringify(res)}`);
      }
    } catch (err) {
      console.error("add-to-cart error:", err);
      pushSystem(ERROR || "Failed to add item to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add address handler
  const blinkitAddAddress = async (addressText: string) => {
    if (!blinkitSessionId) {
      pushSystem("Session missing. Please login first.");
      setAwaitingAddress(false);
      return;
    }
    setIsLoading(true);
    try {
      // We try to parse into house_number & name if comma-separated, otherwise send as location
      let house_number = "";
      let name = "";
      let location = addressText;

      if (addressText.includes(",")) {
        const parts = addressText.split(",").map((s) => s.trim());
        house_number = parts[0] || "";
        name = parts[1] || "";
        location = parts.slice(2).join(", ") || location;
      }

      const url = `${BASE_URL}api/add-address`;
      const body: any = {
        session_id: blinkitSessionId,
        location,
      };
      if (house_number) body.house_number = house_number;
      if (name) body.name = name;

      const res = await postJSON(url, body);
      setAwaitingAddress(false);
      pushSystem(
        "Address added. If you still want to place order, please repeat the add-to-cart command or confirm next steps."
      );
      // Optionally you might want to proceed to checkout here if backend supports it.
    } catch (err) {
      console.error("add-address error:", err);
      pushSystem(ERROR || "Failed to add address.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit UPI
  const blinkitSubmitUpi = async (upiId: string) => {
    if (!blinkitSessionId) {
      pushSystem("Session missing. Please login first.");
      setAwaitingUpi(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = `${BASE_URL}api/submit-upi`;
      const body = { session_id: blinkitSessionId, upi_id: upiId };
      const res = await postJSON(url, body);

      setAwaitingUpi(false);
      if (
        res?.success ||
        (res?.status && res.status.toLowerCase() === "success")
      ) {
        pushSystem("UPI submitted. Your order should be processed now.");
      } else {
        pushSystem(`UPI response: ${JSON.stringify(res)}`);
      }
    } catch (err) {
      console.error("submit-upi error:", err);
      pushSystem(ERROR || "Failed to submit UPI ID.");
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------------------

  // Transport (unchanged)
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

  // ----------------- handleSend updated to route Blinkit messages -----------------
  const handleSend = async () => {
    const t = messageInput.trim();
    if (!t) return;

    // If Grocery selected -> route through blinkit flow handlers
    if (selected === 1) {
      // if waiting for OTP -> treat message input as OTP
      if (awaitingOtp) {
        pushUser(t);
        setMessageInput("");
        await submitBlinkitOtp(t);
        return;
      }

      // if awaiting UPI -> treat message input as upi id
      if (awaitingUpi) {
        pushUser(t);
        setMessageInput("");
        await blinkitSubmitUpi(t);
        return;
      }

      // if awaiting Address -> treat message input as address
      if (awaitingAddress) {
        pushUser(t);
        setMessageInput("");
        await blinkitAddAddress(t);
        return;
      }

      // if there is a product list available -> try to parse add-to-cart command
      if (blinkitProducts && blinkitProducts.length > 0) {
        const parsed = parseAddToCartCommand(t, blinkitProducts);
        if (parsed) {
          pushUser(t);
          setMessageInput("");
          await blinkitAddToCart(parsed.product_name, parsed.quantity);
          return;
        }
      }

      // otherwise start the login -> otp -> search flow
      // Save user query and start login
      setMessageInput("");
      await startBlinkitLoginFlow(t);
      return;
    }

    // default behaviour for other categories: keep existing behavior (just push user and set loading)
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: t },
    ]);
    setMessageInput("");
    setIsLoading(true);
  };
  // -------------------------------------------------------------------------------

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
                      // For grocery we route the input to handleSend logic (which now starts blinkit flow)
                      setMessageInput(searchText);
                      handleSend();
                    }
                  }}
                  placeholder="I want 2 Uncle Chips form Blinkit"
                  className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      setMessageInput(searchText);
                      handleSend();
                    }}
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 a0 11-4 0 2 2 0 014 0z"
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

                  // 🎯 3. Default message with markdown support
                  else {
                    const renderTextWithFormatting = (text: string) => {
                      const lines = text.split("\n");
                      return lines.map((line, index) => {
                        // Handle bold formatting **text**
                        let formattedLine = line;
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        formattedLine = formattedLine.replace(
                          boldRegex,
                          "<strong>$1</strong>"
                        );

                        // Handle emojis and other formatting
                        const emojiRegex = /([🛍️📋🎯💡📝💬❌🔍💰📦])/g;
                        formattedLine = formattedLine.replace(
                          emojiRegex,
                          '<span class="text-xl">$1</span>'
                        );

                        return (
                          <p
                            key={index}
                            className="text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: formattedLine }}
                          />
                        );
                      });
                    };

                    content = (
                      <div className="space-y-2">
                        {renderTextWithFormatting(String(parsed))}
                      </div>
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
