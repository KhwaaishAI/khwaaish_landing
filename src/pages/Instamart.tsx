import React, { useState } from "react";
import { Link } from "react-router-dom";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export default function Instamart() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showPhonePopup, setShowPhonePopup] = useState(true);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showInstamartAddressPopup, setShowInstamartAddressPopup] =
    useState(false);

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [otp, setOtp] = useState("");
  const [instamartSessionId, setInstamartSessionId] = useState("");

  const [upiId, setUpiId] = useState("");

  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingInstamartCart, setLoadingInstamartCart] = useState(false);
  const [loadingInstamartBook, setLoadingInstamartBook] = useState(false);

  const [instamartDoorNo, setInstamartDoorNo] = useState("");
  const [instamartLandmark, setInstamartLandmark] = useState("");
  const [instamartCartItems, setInstamartCartItems] = useState<any[]>([]);

  const [cartSelections, setCartSelections] = useState<{
    [id: string]: { quantity: number; product: any };
  }>({});
  const [selectedProductKey, setSelectedProductKey] = useState<string | null>(
    null
  );

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
    if (!phone.trim() || !location.trim()) return;

    setLoadingPhone(true);

    try {
      const instamartPayload = {
        mobile_number: phone,
        name: "Khwaaish User",
        gmail: "user@khwaaish.com",
        location: location,
      };

      const res = await fetch(`${BaseURL}api/instamart/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instamartPayload),
      });

      const data = await res.json();

      if (data.session_id) {
        setInstamartSessionId(data.session_id);
        setShowPhonePopup(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.log("Instamart login error:", err);
      alert("Something went wrong!");
    }

    setLoadingPhone(false);
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) return;

    setLoadingOtp(true);

    try {
      const res = await fetch(`${BaseURL}api/instamart/submit-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: instamartSessionId,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setShowOtpPopup(false);
      } else {
        alert("Invalid OTP.");
      }
    } catch (err) {
      console.log("Instamart OTP error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setShowChat(true);
    pushUser(messageInput);
    const userText = messageInput;
    setMessageInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BaseURL}api/instamart/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText }),
      });

      const data = await res.json();

      if (data.session_id) {
        setInstamartSessionId(data.session_id);
      }

      const products = (data.results || []).slice(0, 24);

      pushSystem(
        JSON.stringify({
          type: "product_list",
          products,
        })
      );
    } catch (err) {
      console.log("Instamart search error:", err);
      pushSystem("Something went wrong! " + err);
    }

    setIsLoading(false);
  };

  const handleConfirmCart = async () => {
    if (loadingInstamartCart) return;

    const instamartItems: { product: any; quantity: number }[] = [];

    Object.values(cartSelections).forEach((item) => {
      if (item.quantity > 0) {
        instamartItems.push({ product: item.product, quantity: item.quantity });
      }
    });

    if (instamartItems.length === 0) {
      pushSystem("Please select at least one item.");
      return;
    }

    await processInstamartCart(instamartItems);
  };

  const processInstamartCart = async (
    items: { product: any; quantity: number }[]
  ) => {
    setLoadingInstamartCart(true);

    try {
      setInstamartCartItems(items);

      for (const item of items) {
        const payload = {
          product_name: item.product.name,
          quantity: item.quantity,
          session_id: instamartSessionId,
        };

        const res = await fetch(`${BaseURL}api/instamart/add-to-cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // Keep session id in sync with backend response
        if (data.session_id) {
          setInstamartSessionId(data.session_id);
        }

        if (data.status === "success") {
          pushSystem(
            `Added ${item.quantity}x ${item.product.name} to Instamart cart`
          );
        } else {
          pushSystem(
            `Failed to add ${item.product.name} to Instamart cart: ${data.message}`
          );
        }
      }

      setLoadingInstamartCart(false);

      if (items.length > 0) {
        setTimeout(() => {
          pushSystem(
            "Instamart items added! Please provide delivery details to complete your order."
          );
          setShowInstamartAddressPopup(true);
        }, 500);
      }
    } catch (err) {
      console.log("Instamart cart error:", err);
      pushSystem("Something went wrong with Instamart order");
      setLoadingInstamartCart(false);
    }
  };

  const handleInstamartBook = async () => {
    if (!instamartDoorNo.trim() || !instamartLandmark.trim() || !upiId.trim()) {
      alert("Please fill all fields: Door Number, Landmark, and UPI ID");
      return;
    }

    setLoadingInstamartBook(true);

    try {
      const bookPayload = {
        session_id: instamartSessionId,
        door_no: instamartDoorNo,
        landmark: instamartLandmark,
        upi_id: upiId,
      };

      const res = await fetch(`${BaseURL}api/instamart/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookPayload),
      });

      const data = await res.json();

      if (data.status === "success") {
        pushSystem("Your Instamart order has been booked successfully!");

        setInstamartCartItems([]);
        setInstamartDoorNo("");
        setInstamartLandmark("");
        setShowInstamartAddressPopup(false);

        setCartSelections({});
      } else {
        pushSystem(
          `Instamart booking failed: ${data.message || "Unknown error"}`
        );
      }
    } catch (err: any) {
      console.log("Instamart booking error:", err);
      pushSystem(
        `Error: ${err.message || "Something went wrong with Instamart booking"}`
      );
    } finally {
      setLoadingInstamartBook(false);
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

          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              {parsed.products?.slice(0, 24).map((p: any, index: number) => {
                const key = `${p.name}|${p.price}`;
                const qty = cartSelections[key]?.quantity || 0;
                const isSelected = selectedProductKey === key;

                return (
                  <div
                    key={key + index}
                    onClick={() => setSelectedProductKey(key)}
                    className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm transition-colors cursor-pointer ${
                      isSelected ? "bg-[#181924]" : "hover:bg-[#151622]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                        +1
                      </div>
                    )}
                    {p.image_url && (
                      <div className="relative w-full h-36 bg-gray-800">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/15 text-green-300">
                          Instamart
                        </span>
                      </div>

                      <div className="space-y-1 min-h-[48px]">
                        <p className="text-sm font-semibold text-white line-clamp-2">
                          {p.name}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <p className="text-base font-bold text-white">
                          ₹{p.price}
                        </p>
                        {p.original_price && p.original_price !== p.price && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{p.original_price}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() =>
                              setCartSelections((prev: any) => {
                                const current = prev[key] || {
                                  quantity: 0,
                                  product: p,
                                };
                                return {
                                  ...prev,
                                  [key]: {
                                    ...current,
                                    quantity: Math.max(current.quantity - 1, 0),
                                  },
                                };
                              })
                            }
                            className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm">{qty}</span>
                          <button
                            onClick={() =>
                              setCartSelections((prev: any) => {
                                const current = prev[key] || {
                                  quantity: 0,
                                  product: p,
                                };
                                return {
                                  ...prev,
                                  [key]: {
                                    ...current,
                                    quantity: current.quantity + 1,
                                  },
                                };
                              })
                            }
                            className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConfirmCart}
                className={`px-5 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  loadingInstamartCart
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/25"
                }`}
                disabled={loadingInstamartCart}
              >
                {loadingInstamartCart ? (
                  <>
                    <PopupLoader />
                    Processing Instamart...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>
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

    return typeof parsed === "object" && parsed?.type === "product_list" ? (
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
            <h2 className="text-xl font-semibold text-white">
              Enter Instamart OTP
            </h2>

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

      {/* INSTAMART ADDRESS & UPI POPUP */}
      {showInstamartAddressPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Instamart Delivery Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Door/Flat Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 101, Bldg A"
                  value={instamartDoorNo}
                  onChange={(e) => setInstamartDoorNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g., Near Metro Station"
                  value={instamartLandmark}
                  onChange={(e) => setInstamartLandmark(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="example@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleInstamartBook}
              disabled={loadingInstamartBook}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingInstamartBook ? <PopupLoader /> : "Confirm & Pay"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT (copied from Chat1-style) */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {showChat ? (
        <div className="relative min-h-screen w-full bg-black overflow-hidden">
          <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m) => renderMessage(m))}
            {isLoading && <FlowerLoader />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="absolute bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
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
                placeholder="What do you want from Instamart?"
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />

              <VoiceRecorderButton
                onTextReady={(text) => {
                  setMessageInput(text);
                }}
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

          <main className="flex-1 flex flex-col relative">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    I
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <img src="/images/LOGO.png" alt="" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                    Swiggy Instamart with Khwaaish AI
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg">
                    Tell me what you need and I’ll shop Instamart for you.
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
                    placeholder="What do you want to order from Instamart?"
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
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
