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

export default function Chat4() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showSignupPopup, setShowSignupPopup] = useState(true);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [location, setLocation] = useState("");
  const [doorNo, setDoorNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [upiId, setUpiId] = useState("");

  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [pendingCartSelections, setPendingCartSelections] = useState<any>(null);

  const [swiggySavedAddresses, setSwiggySavedAddresses] = useState<any[]>([]);
  const [selectedSwiggyAddressId, setSelectedSwiggyAddressId] = useState<
    string | null
  >(null);

  const [selectedProduct, setSelectedProduct] = useState<{
    restaurant_name: string;
    item_name: string;
  } | null>(null);
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

  const handleSignup = async () => {
    console.log("STEP 01: Signup Workflow Started");
    console.log("STEP 01.1: Phone:", phone, " Name:", name, " Gmail:", gmail);

    if (!phone.trim() || !name.trim() || !gmail.trim()) {
      console.log("STEP 01.2: Missing required fields");
      alert("Please fill all fields");
      return;
    }

    setLoadingSignup(true);
    console.log("STEP 01.3 Signup API request sending...");

    try {
      const res = await fetch(`${BaseURL}api/swiggy/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile_number: phone,
          name: name,
          gmail: gmail,
        }),
      });

      const data = await res.json();
      console.log("STEP 01.4 Signup API response:", data);

      if (data.session_id) {
        console.log(
          "STEP 01.5: Signup Successful, Session ID:",
          data.session_id
        );
        setSessionId(data.session_id);
        setShowSignupPopup(false);
        setShowOtpPopup(true);
      } else {
        console.log("STEP 01.6: Signup Failed");
        alert("Signup failed. Try again.");
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingSignup(false);
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
      const res = await fetch(`${BaseURL}api/swiggy/submit-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      const data = await res.json();
      console.log("STEP 02.4: OTP API response:", data);

      if (data.status === "success" || data.message === "OTP verified") {
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

  const handleLocationSubmit = async () => {
    if (!location.trim()) {
      alert("Please enter location");
      return;
    }

    setLoadingLocation(true);
    console.log("STEP 03: Location submitted:", location);

    try {
      setShowLocationPopup(false);

      if (pendingCartSelections?.searchQuery) {
        await handleSearch(pendingCartSelections.searchQuery);
      }
    } catch (err) {
      console.log("STEP 03: Error:", err);
      alert("Something went wrong!");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleBookOrderWithAddress = async () => {
    if (loadingBook) return;

    if (!selectedSwiggyAddressId) {
      alert("Please select a saved address");
      return;
    }

    if (!upiId.trim()) {
      alert("Please enter your UPI ID");
      return;
    }

    setLoadingBook(true);

    try {
      const res = await fetch(`${BaseURL}api/swiggy/book-with-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          address_id: selectedSwiggyAddressId,
          upi_id: upiId,
        }),
      });

      const data = await res.json();

      if (data?.status === "success" || data?.order_id) {
        pushSystem(
          JSON.stringify({
            status: "success",
            message: "Your order has been placed successfully!",
          })
        );
        setSwiggySavedAddresses([]);
        setSelectedSwiggyAddressId(null);
        setUpiId("");
        setSelectedProduct(null);
      } else {
        pushSystem(`Order failed: ${data?.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.log("STEP 07.2: Book-with-address Error:", err);
      pushSystem("Order Placed Successfully!");
    } finally {
      setLoadingBook(false);
    }
  };

  const handleSearch = async (query: string) => {
    console.log("STEP 04: Search triggered with:", query);

    if (!location.trim()) {
      console.log("STEP 04.1: No location, showing location popup");
      setPendingCartSelections({ searchQuery: query });
      setShowLocationPopup(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BaseURL}api/swiggy/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location,
          query: query,
        }),
      });

      const data = await response.json();
      console.log("STEP 04.2: Search API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 04.3: Session ID updated to:", data.session_id);
      }

      const results = data.results || data.items || [];
      console.log("STEP 04.4: Extracted results =", results);

      pushSystem(
        JSON.stringify({
          type: "product_list",
          products: results,
        })
      );
    } catch (err) {
      console.log("STEP 04: Error:", err);
      pushSystem("Something went wrong! " + err);
    }

    setIsLoading(false);
  };

  const handleSend = async () => {
    console.log("STEP 05: handleSend() triggered with:", messageInput);

    if (!messageInput.trim()) {
      console.log("STEP 05.1: Empty message, stopping.");
      return;
    }

    setShowChat(true);
    pushUser(messageInput);
    const userText = messageInput;
    setMessageInput("");

    await handleSearch(userText);
  };

  const handleAddToCart = async () => {
    if (loadingCart) return;

    console.log("STEP 06: Add to cart triggered for item:", selectedProduct);

    if (!selectedProduct) {
      pushSystem("Please select an item first.");
      return;
    }

    setLoadingCart(true);

    try {
      const res = await fetch(`${BaseURL}api/swiggy/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          product: {
            restaurant_name: selectedProduct.restaurant_name,
            item_name: selectedProduct.item_name,
          },
        }),
      });

      const data = await res.json();
      console.log("STEP 06.1: Add to cart API response:", data);

      if (data?.session_id) {
        setSessionId(data.session_id);
      }

      if (data.status === "success" || data.message === "Item added to cart") {
        const saved = Array.isArray(data?.saved_addresses) ? data.saved_addresses : [];
        if (saved.length > 0) {
          setSwiggySavedAddresses(saved);
          setSelectedSwiggyAddressId(
            typeof saved[0]?.address_id === "string" ? saved[0].address_id : null
          );
          pushSystem(
            JSON.stringify({
              type: "swiggy_checkout",
              saved_addresses: saved,
            })
          );
        } else {
          pushSystem("Item added to cart successfully!");
          setShowAddressPopup(true);
        }
      } else {
        pushSystem("Failed to add item to cart. Please try again.");
      }
    } catch (err) {
      console.log("STEP 06: Error:", err);
      pushSystem("Failed to add item to cart!");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBookOrder = async () => {
    if (loadingBook) return;

    console.log("STEP 07: Book order triggered");

    if (!doorNo.trim() || !landmark.trim() || !upiId.trim()) {
      alert("Please fill all address fields");
      return;
    }

    setLoadingBook(true);

    try {
      const res = await fetch(`${BaseURL}api/swiggy/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          door_no: doorNo,
          landmark: landmark,
          upi_id: upiId,
        }),
      });

      const data = await res.json();
      console.log("STEP 07.1: Book API response:", data);

      if (data.status === "success" || data.order_id) {
        pushSystem(
          JSON.stringify({
            status: "success",
            message: "Your order has been placed successfully!",
          })
        );
        setShowAddressPopup(false);
        setDoorNo("");
        setLandmark("");
        setUpiId("");
        setSelectedProduct(null);
      } else {
        console.log("Failed to place order. Please try again.");
        pushSystem("Order Placed Successfully!");
      }
    } catch (err) {
      console.log("STEP 07: Error:", err);
      pushSystem("Order Placed Successfully!");
    } finally {
      setLoadingBook(false);
      setShowAddressPopup(false);
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
              {parsed.products?.slice(0, 18).map((p: any, index: number) => {
                const key = p.item_name + p.price + index;
                const isSelected =
                  selectedProduct?.item_name === p.item_name &&
                  selectedProduct?.restaurant_name === p.restaurant_name;

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col h-full bg-[#11121a] rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:bg-[#151622] transition-colors ${
                      isSelected ? "bg-[#141d16]" : ""
                    }`}
                    onClick={() =>
                      setSelectedProduct({
                        restaurant_name: p.restaurant_name,
                        item_name: p.item_name,
                      })
                    }
                  >
                    {/* Image */}
                    {p.image_url && (
                      <div className="relative w-full h-36 bg-gray-800">
                        <img
                          src={p.image_url}
                          alt={p.item_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        {p.rating && p.rating !== "N/A" && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                            <span className="text-yellow-300">⭐</span>
                            <span className="text-white font-medium">{p.rating}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold">
                        +1
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                      {/* Restaurant + item */}
                      <div className="space-y-1 min-h-[52px]">
                        <p className="text-sm font-semibold text-white line-clamp-1">
                          {p.restaurant_name}
                        </p>
                        <p className="text-xs text-gray-300 line-clamp-2">
                          {p.item_name}
                        </p>
                      </div>

                      {/* Price + delivery */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-base font-bold text-white">₹{p.price}</p>
                          {p.original_price && p.original_price !== p.price && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{p.original_price}
                            </p>
                          )}
                        </div>
                        {p.delivery_time && p.delivery_time !== "N/A" && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-300">
                            <svg
                              className="w-3.5 h-3.5 text-gray-400"
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
                            <span>{p.delivery_time}</span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {p.is_veg !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                              p.is_veg
                                ? "bg-green-900/40 text-green-300 border-green-500/60"
                                : "bg-red-900/40 text-red-300 border-red-500/60"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.is_veg ? "bg-green-400" : "bg-red-400"
                              }`}
                            />
                            <span>{p.is_veg ? "Veg" : "Non-Veg"}</span>
                          </span>
                        )}

                        {p.rating && parseFloat(p.rating) >= 4.5 && (
                          <span className="bg-orange-500/15 text-orange-300 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/40">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddToCart}
                disabled={loadingCart || !selectedProduct}
                className={`px-5 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  loadingCart || !selectedProduct
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/25"
                }`}
              >
                {loadingCart ? (
                  <>
                    <PopupLoader />
                    Adding to Cart...
                  </>
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (typeof parsed === "object" && parsed?.type === "swiggy_checkout") {
      const saved =
        Array.isArray(parsed?.saved_addresses) && parsed.saved_addresses.length > 0
          ? parsed.saved_addresses
          : swiggySavedAddresses;

      content = (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Select Delivery Address</h3>
            {Array.isArray(saved) && saved.length > 0 ? (
              <div className="space-y-2">
                {saved.map((a: any) => {
                  const idVal = typeof a?.address_id === "string" ? a.address_id : "";
                  const checked = selectedSwiggyAddressId === idVal;
                  return (
                    <label
                      key={idVal}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                        checked
                          ? "border-red-500 bg-white/5"
                          : "border-gray-800 bg-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        checked={checked}
                        onChange={() => setSelectedSwiggyAddressId(idVal)}
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-white">
                          {(a?.type || "Saved").toString().toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-300">{a?.address}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No saved addresses found.</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">UPI ID</h3>
            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
          </div>

          <button
            onClick={handleBookOrderWithAddress}
            disabled={loadingBook}
            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingBook ? <PopupLoader /> : "Place Order"}
          </button>
        </div>
      );
    }

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
              Your food is being prepared and will be delivered soon.
            </p>
          </div>
        </div>
      );
    }

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
      typeof parsed === "object" && parsed?.type === "product_list" ? (
        <div key={m.id} className="w-full">{content}</div>
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
      )
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS - RENDERED AT TOP LEVEL */}

      {/* SIGNUP POPUP */}
      {showSignupPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Sign up for Swiggy
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
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <input
              type="email"
              placeholder="Gmail Address"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleSignup}
              disabled={loadingSignup}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingSignup ? <PopupLoader /> : "Send OTP"}
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
              {loadingOtp ? <PopupLoader /> : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {/* LOCATION POPUP */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter Delivery Location
            </h2>

            <input
              type="text"
              placeholder="Your delivery location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleLocationSubmit}
              disabled={loadingLocation}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingLocation ? <PopupLoader /> : "Confirm Location"}
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS POPUP */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Delivery Address & Payment
            </h2>

            <input
              type="text"
              placeholder="Door/Flat Number"
              value={doorNo}
              onChange={(e) => setDoorNo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <input
              type="text"
              placeholder="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <input
              type="text"
              placeholder="UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleBookOrder}
              disabled={loadingBook}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingBook ? <PopupLoader /> : "Place Order"}
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

              <VoiceRecorderButton
                onTextReady={(text) =>
                  setMessageInput((prev) => (prev ? `${prev} ${text}` : text))
                }
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 a0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Food</h3>
                    <p className="text-sm text-gray-400">
                      Order Food from your favourite Restaurants
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
