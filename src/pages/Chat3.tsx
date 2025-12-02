import React, { useState } from "react";
import { Link } from "react-router-dom";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function MyntraChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Myntra specific popups
  const [showLoginPopup, setShowLoginPopup] = useState(true);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  // Myntra form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [upiId, setUpiId] = useState("");

  // Address form states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pincode, setPincode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [locality, setLocality] = useState("");

  // Loading states
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  // Available sizes for Myntra
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Format and push system message
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

  // -------------------------------
  // LOGIN FLOW
  // -------------------------------
  const handleLogin = async () => {
    console.log("STEP 01: Login Workflow Started");
    console.log("STEP 01.1: Phone:", phone);

    if (!phone.trim()) {
      console.log("STEP 01.2: Missing phone number");
      alert("Please enter your phone number");
      return;
    }

    setLoadingLogin(true);
    console.log("STEP 01.3 Login API request sending...");

    try {
      const res = await fetch(`${BaseURL}api/myntra/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile_number: phone,
        }),
      });

      const data = await res.json();
      console.log("STEP 01.4 Login API response:", data);

      if (data.session_id) {
        console.log(
          "STEP 01.5: Login Successful, Session ID:",
          data.session_id
        );
        setSessionId(data.session_id);
        setShowLoginPopup(false);
        setShowOtpPopup(true);
      } else {
        console.log("STEP 01.6: Login Failed");
        alert("Login failed. Try again.");
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingLogin(false);
  };

  // -------------------------------
  // OTP HANDLER
  // -------------------------------
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
      const res = await fetch(`${BaseURL}api/myntra/submit-otp`, {
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

  // -------------------------------
  // SEARCH HANDLER
  // -------------------------------
  const handleSearch = async (query: string) => {
    console.log("STEP 03: Search triggered with:", query);

    setIsLoading(true);

    try {
      const response = await fetch(`${BaseURL}api/myntra/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
        }),
      });

      const data = await response.json();
      console.log("STEP 03.2: Search API response:", data);

      // Update session ID if provided
      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 03.3: Session ID updated to:", data.session_id);
      }

      // Extract results
      const products = data.products || data.results || [];
      console.log("STEP 03.4: Extracted products =", products);

      // Pass to chatbot renderer
      pushSystem(
        JSON.stringify({
          type: "product_list",
          products: products,
        })
      );
    } catch (err) {
      console.log("STEP 03: Error:", err);
      pushSystem("Something went wrong! " + err);
    }

    setIsLoading(false);
  };

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------
  const handleSend = async () => {
    if (!messageInput.trim()) {
      console.log("STEP 03: Empty message, stopping.");
      return;
    }

    setShowChat(true);
    pushUser(messageInput);
    const userText = messageInput;
    setMessageInput("");

    // Trigger search
    await handleSearch(userText);
  };

  // -------------------------------
  // ADD TO CART HANDLER
  // -------------------------------
  const handleAddToCart = async () => {
    if (loadingCart) return;

    console.log("STEP 04: Add to cart triggered for product:", pendingProduct);

    if (!pendingProduct || !selectedSize) {
      pushSystem("Please select a product and size first.");
      return;
    }

    setLoadingCart(true);

    try {
      const res = await fetch(`${BaseURL}api/myntra/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_url: pendingProduct.url,
          size: selectedSize,
        }),
      });

      const data = await res.json();
      console.log("STEP 04.1: Add to cart API response:", data);

      // Update session ID if provided
      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 04.2: Session ID updated to:", data.session_id);
      }

      if (data.status === "success") {
        pushSystem("Item added to cart successfully!");
        // Show address popup
        setShowAddressPopup(true);
      } else if (data.status === "address_required") {
        pushSystem("I need your address to complete the order");
        setShowAddressPopup(true);
      } else if (data.status === "upi_required") {
        pushSystem("I need your address to complete the order");
        setShowUpiPopup(true);
      } else {
        pushSystem("Failed to add item to cart. Please try again.");
      }
    } catch (err) {
      console.log("STEP 04: Error:", err);
      pushSystem("Failed to add item to cart!");
    } finally {
      setShowSizePopup(false);
      setLoadingCart(false);
    }
  };

  // -------------------------------
  // ADD ADDRESS HANDLER
  // -------------------------------
  const handleAddAddress = async () => {
    if (loadingAddress) return;

    console.log("STEP 05: Adding address");

    if (
      !name.trim() ||
      !mobile.trim() ||
      !pincode.trim() ||
      !houseNumber.trim() ||
      !streetAddress.trim() ||
      !locality.trim()
    ) {
      alert("Please fill all address fields");
      return;
    }

    setLoadingAddress(true);

    try {
      const res = await fetch(`${BaseURL}api/myntra/add-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          name: name,
          mobile: mobile,
          pincode: pincode,
          house_number: houseNumber,
          street_address: streetAddress,
          locality: locality,
          address_type: "HOME",
          make_default: false,
        }),
      });

      const data = await res.json();
      console.log("STEP 05.1: Add address API response:", data);

      if (data.status === "success") {
        pushSystem("Address added successfully!");
        setShowAddressPopup(false);
        // Show UPI popup for payment
        setShowUpiPopup(true);
      } else {
        alert("Failed to add address. Please try again.");
      }
    } catch (err) {
      console.log("STEP 05: Error:", err);
      alert("Something went wrong while adding address.");
    } finally {
      setLoadingAddress(false);
    }
  };

  // -------------------------------
  // PAYMENT HANDLER
  // -------------------------------
  const handlePayment = async () => {
    if (loadingPayment) return;

    console.log("STEP 07: Processing payment");

    if (!upiId.trim()) {
      alert("Please enter UPI ID");
      return;
    }

    setLoadingPayment(true);

    try {
      const res = await fetch(`${BaseURL}api/myntra/pay-with-upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          upi_id: upiId,
        }),
      });

      const data = await res.json();
      console.log("STEP 07.1: Payment API response:", data);

      if (data.status === "success" || data.order_id) {
        pushSystem(
          JSON.stringify({
            status: "success",
            message: "Your order has been placed successfully! 🎉",
          })
        );
        setShowUpiPopup(false);
        // Reset form
        setUpiId("");
        setPendingProduct(null);
        setSelectedSize("");
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.log("STEP 07: Error:", err);
      alert("Something went wrong during payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // -----------------------------------
  // RENDER MESSAGE
  // -----------------------------------
  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    // Product list with selection
    if (typeof parsed === "object" && parsed?.type === "product_list") {
      content = (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">
            Here are some fashion finds:
          </h3>

          <div className="grid gap-4">
            {parsed.products?.map((p: any, index: number) => {
              const key = p.brand + p.name + p.price + index;

              return (
                <div
                  key={key}
                  className="flex gap-4 p-4 rounded-xl border border-gray-700 bg-gray-900/60 cursor-pointer transition-all hover:border-gray-600"
                  onClick={() => {
                    setPendingProduct(p);
                    setShowSizePopup(true);
                  }}
                >
                  {/* Product Image */}
                  {p.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-20 h-24 object-cover rounded-lg bg-gray-800"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    {/* Brand and Name */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white text-base truncate">
                          {p.brand}
                        </p>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                          {p.name}
                        </p>
                      </div>
                      {p.rating && (
                        <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-white text-sm font-medium">
                            {p.rating}
                          </span>
                          {p.rating_count && (
                            <span className="text-gray-400 text-xs">
                              ({p.rating_count})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Discount */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-lg font-bold text-white">
                          {p.price}
                        </p>
                        {p.original_price && p.original_price !== p.price && (
                          <p className="text-sm text-gray-400 line-through">
                            {p.original_price}
                          </p>
                        )}
                        {p.discount && (
                          <p className="text-sm text-green-400 bg-green-900/30 px-2 py-1 rounded">
                            {p.discount}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Select button */}
                    <div className="flex justify-end mt-3">
                      <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors">
                        Select Size
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Order success
    else if (
      (typeof parsed === "object" &&
        parsed?.status?.toLowerCase() === "success") ||
      (typeof parsed === "string" && parsed.trim().toLowerCase() === "success")
    ) {
      content = (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-600 rounded-xl">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
          <div>
            <p className="font-semibold text-green-400">Order Confirmed! 🎉</p>
            <p className="text-sm text-green-300 mt-1">
              Your fashion item will be delivered soon.
            </p>
          </div>
        </div>
      );
    }

    // Normal formatted text
    else {
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
          } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
        >
          {content}
        </div>
      </div>
    );
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS - RENDERED AT TOP LEVEL */}

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Login to Myntra
            </h2>

            <input
              type="text"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleLogin}
              disabled={loadingLogin}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingLogin ? <PopupLoader /> : "Send OTP"}
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
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingOtp ? <PopupLoader /> : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {/* SIZE SELECTION POPUP */}
      {showSizePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Select Size</h2>

            {pendingProduct && (
              <div className="bg-gray-800 p-3 rounded-lg mb-4">
                <p className="font-semibold">{pendingProduct.brand}</p>
                <p className="text-sm text-gray-300">{pendingProduct.name}</p>
                <p className="text-green-400 font-semibold mt-1">
                  {pendingProduct.price}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? "border-pink-500 bg-pink-500/20 text-white"
                      : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loadingCart || !selectedSize}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingCart ? <PopupLoader /> : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS POPUP */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Delivery Address
            </h2>

            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="House/Flat Number"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Locality/Area"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
            </div>

            <button
              onClick={handleAddAddress}
              disabled={loadingAddress}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingAddress ? <PopupLoader /> : "Save Address"}
            </button>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Payment</h2>

            <input
              type="text"
              placeholder="UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handlePayment}
              disabled={loadingPayment}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPayment ? <PopupLoader /> : "Pay Now"}
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

                {/* Card */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  <Link
                    to="/shopping"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
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
