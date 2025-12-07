import React, { useState } from "react";
import { Link } from "react-router-dom";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export default function Chat6() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showPhonePopup, setShowPhonePopup] = useState(true);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [showUpiPopup, setShowUpiPopup] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [loadingUpi, setLoadingUpi] = useState(false);

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  const [pendingCartSelections, setPendingCartSelections] = useState<any>(null);
  const [cartSelections, setCartSelections] = useState<{
    [id: string]: number;
  }>({});

  const [holdSeconds] = useState(59);

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
    console.log("STEP 01: Login Workflow Started");
    console.log("STEP 01.1: Phone:", phone, " Location:", location);

    if (!phone.trim() || !location.trim()) {
      console.log("STEP 01.2: Missing phone or location");
      return;
    }

    setLoadingPhone(true);

    try {
      const endpoint = "jiomart/login";
      const payload = {
        mobile_number: phone,
        location: location,
      };
      console.log("STEP 01.3 Login API request sending...", payload);

      const res = await fetch(`${BaseURL}api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("STEP 01.4 Login API response:", data);

      if (data.session_id) {
        console.log(
          "STEP 01.5: Login Successful, Session ID:",
          data.session_id
        );
        setSessionId(data.session_id);
        setShowPhonePopup(false);
        setShowOtpPopup(true);
      } else {
        console.log("STEP 01.6: Login Failed");
        alert("Login failed. Try again.");
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingPhone(false);
  };

  const handleOtpSubmit = async () => {
    console.log("STEP 02: OTP workflow started");
    console.log("STEP 02.1: OTP entered:", otp);

    if (!otp.trim()) {
      console.log("STEP 02.2: Missing OTP");
      return;
    }
    setLoadingOtp(true);
    console.log("STEP 02.3: OTP API request sending...");

    try {
      const endpoint = "jiomart/verify-otp";

      const res = await fetch(`${BaseURL}api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      const data = await res.json();
      console.log("STEP 02.4: OTP API response:", data);

      if (data.status === "success") {
        console.log("STEP 02.5: OTP verification successful");
        setShowOtpPopup(false);
      } else {
        console.log("STEP 02.6: OTP verification failed");
        alert("Invalid OTP.");
      }
    } catch (err) {
      console.log("STEP 02: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleSend = async () => {
    console.log("STEP 03: handleSend() triggered with:", messageInput);

    if (!messageInput.trim()) {
      console.log("STEP 03.1: Empty message, stopping.");
      return;
    }

    setShowChat(true);

    pushUser(messageInput);

    const userText = messageInput;
    setMessageInput("");
    setIsLoading(true);

    const endpoint = "jiomart/search";
    const searchPayload = { query: userText, max_items: 20 };

    console.log("STEP 03.2: Search API request sending...");

    try {
      const response = await fetch(`${BaseURL}api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload),
      });

      const data = await response.json();
      console.log("STEP 03.3: Search API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 03.4: Session ID updated to:", data.session_id);
      }

      console.log(
        "STEP 03.5: Extracting actual product list from response",
        data
      );

      let productList = data.products;

      console.log("STEP 03.7: Extracted productList =", productList);

      pushSystem(
        JSON.stringify({
          type: "product_list",
          products: productList,
        })
      );
    } catch (err) {
      console.log("STEP 03: Error:", err);
      pushSystem("Something went wrong! " + err);
    }

    setIsLoading(false);
  };

  const handleConfirmCart = async () => {
    if (loadingCart) return;

    console.log("STEP 04: handleConfirmCart() triggered with:", cartSelections);

    const selectedItems = Object.entries(cartSelections).filter(
      ([_, qty]) => qty > 0
    );

    if (selectedItems.length === 0) {
      pushSystem("Please select at least one item.");
      return;
    }

    const currentCart = { ...cartSelections };

    console.log(
      "STEP 04.1: Checking UPI ID - upiId:",
      upiId,
      "hasValue:",
      !!upiId
    );

    if (upiId == "") {
      console.log(
        "STEP 04.2: JioMart API - UPI ID required, showing UPI popup"
      );
      setPendingCartSelections(currentCart);
      setShowUpiPopup(true);
    }

    for (const [productUrl, qty] of selectedItems) {
      const endpoint = "jiomart/add-to-cart";
      const payload = {
        product_url: productUrl,
        quantity: qty,
        hold_seconds: holdSeconds,
      };

      console.log("STEP 04.3: Add to cart API request sending...", payload);

      setLoadingCart(true);

      try {
        const res = await fetch(`${BaseURL}api/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("STEP 04.4: Add to cart API response:", data);

        if (data === null || data.order_placed) {
          pushSystem(
            JSON.stringify({
              status: "success",
              message: "Your order has been completed!",
            })
          );
        } else if (
          data.status === "error" &&
          data.message === "Cart is empty."
        ) {
          pushSystem("The Item is Out of Stock now!");
        } else {
          pushSystem(JSON.stringify(data));
        }
      } catch (err) {
        console.log("STEP 04: Error:", err);
        pushSystem(`Payment Request Sent to your UPI ID`);
      } finally {
        setLoadingCart(false);
      }
    }

    setCartSelections({});
    setUpiId("");
  };

  const handleUpiSubmit = async () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID");
      return;
    }

    setLoadingUpi(true);
    console.log("STEP 05: Submitting UPI ID...", upiId);

    try {
      setShowUpiPopup(false);
      pushSystem("UPI ID collected. Placing your order...");

      if (pendingCartSelections) {
        setCartSelections(pendingCartSelections);
        setPendingCartSelections(null);
        handleConfirmCart();
      }
    } catch (err) {
      console.log("STEP 05: Error submitting UPI ID:", err);
      alert("Something went wrong while submitting UPI ID.");
    } finally {
      setLoadingUpi(false);
    }
  };

  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (typeof parsed === "object" && parsed?.type === "product_list") {
      content = (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">Here are some options:</h3>

          <div className="flex max-w-5xl overflow-auto gap-4">
            {parsed.products?.map((p: any) => {
              const key = p.name + p.price;
              const qty = cartSelections[key] || 0;

              return (
                <div
                  key={key}
                  className="flex flex-col gap-3 p-3 min-w-52 rounded-xl border border-gray-700 bg-gray-900/60"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-48 h-40 object-cover rounded-lg"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-300">₹{p.price}</p>
                    </div>

                    <div className="flex items-end justify-end  gap-3 mt-2">
                      <button
                        onClick={() =>
                          setCartSelections((prev: any) => ({
                            ...prev,
                            [key]: Math.max((prev[key] || 0) - 1, 0),
                          }))
                        }
                        className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center"
                      >
                        -
                      </button>

                      <span className="w-6 text-center">{qty}</span>

                      <button
                        onClick={() =>
                          setCartSelections((prev: any) => ({
                            ...prev,
                            [key]: (prev[key] || 0) + 1,
                          }))
                        }
                        className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
            <button
              onClick={handleConfirmCart}
              className={`px-4 py-2 rounded-xl mt-4 font-semibold flex items-center justify-center gap-2 ${
                loadingCart
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {loadingCart ? (
                <>
                  <PopupLoader />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
        </div>
      );
    } else if (
      (typeof parsed === "object" &&
        parsed?.status?.toLowerCase() === "success") ||
      (typeof parsed === "string" && parsed.trim().toLowerCase() === "success")
    ) {
      content = <p className="font-semibold">Your order has been placed!</p>;
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
          } 
          max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS - RENDERED AT TOP LEVEL */}
      {/* PHONE NUMBER POPUP */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter your details
            </h2>

            <input
              type="text"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleLogin}
              disabled={loadingPhone}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPhone ? <PopupLoader /> : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* OTP POPUP */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Enter OTP</h2>

            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleOtpSubmit}
              disabled={loadingOtp}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingOtp ? <PopupLoader /> : "Verify"}
            </button>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Enter UPI ID</h2>

            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleUpiSubmit}
              disabled={loadingUpi}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingUpi ? <PopupLoader /> : "Submit"}
            </button>
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
            {isLoading && <FlowerLoader />}
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!messageInput.trim()) return;
                    setShowChat(true);
                    handleSend();
                  }
                }}
                placeholder="What is your khwaaish?"
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <button
                type="submit"
                className={`p-2.5 rounded-full ${
                  messageInput
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-white/20 hover:bg-white/30"
                }`}
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
                    placeholder="What is your household...."
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

                {/* Cards */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  {/* GROCERIES */}

                  <Link
                    to="/groceries"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
                  border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer group"
                  >
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
