import React, { useState } from "react";
import { Link } from "react-router-dom";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface Product {
  url?: string;
  product_url?: string;
  title?: string;
  product_title?: string;
  price?: string;
  image_url?: string;
  rating?: string;
  discount?: string;
  brand?: string;
  name?: string;
  original_price?: string;
  available_sizes?: string[];
}

interface Address {
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line1: string;
}

interface AddressFromAPI {
  address_id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

export default function Flipkart() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [upiId, setUpiId] = useState("");
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address_line1: "",
  });

  const [addresses, setAddresses] = useState<AddressFromAPI[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [isClothingSearch, setIsClothingSearch] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

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

  const handleSearch = async (query: string) => {
    console.log("STEP 01: Search triggered with:", query);
    setLastSearchQuery(query);

    if (!query.trim()) {
      pushSystem("Please enter a product to search!");
      return;
    }

    setIsLoading(true);
    pushUser(query);

    const clothingKeywords = [
      "t-shirt",
      "tshirt",
      "t shirt",
      "shirt",
      "jeans",
      "pant",
      "pants",
      "trouser",
      "trousers",
      "kurta",
      "suit",
      "jacket",
      "hoodie",
      "sweater",
      "dress",
      "gown",
      "skirt",
      "top",
      "blouse",
      "shorts",
      "track",
      "jogger",
      "leggings",
      "jeggings",
      "blazer",
      "coat",
      "raincoat",
      "windcheater",
      "innerwear",
      "lingerie",
      "bra",
      "panties",
      "socks",
      "stockings",
      "nightwear",
      "pyjamas",
      "ethnic",
      "traditional",
      "western",
      "men",
      "women",
      "kids",
      "boy",
      "girl",
      "cloth",
      "clothing",
      "apparel",
      "garment",
      "wear",
      "outfit",
      "attire",
    ];

    const queryLower = query.toLowerCase();
    const isClothing = clothingKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    setIsClothingSearch(isClothing);
    console.log("Is clothing search:", isClothing);

    try {
      const response = await fetch(`${BaseURL}/api/flipkart/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
        }),
      });

      const data = await response.json();
      console.log("STEP 01.2: Search API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 01.3: Session ID updated to:", data.session_id);
      }

      const products =
        data.data?.products || data.products || data.results || [];
      console.log("STEP 01.4: Extracted products =", products.length);

      pushSystem(
        JSON.stringify({
          type: "product_list",
          products: products,
          isClothing: isClothing,
        })
      );
    } catch (err) {
      console.log("STEP 01: Error:", err);
      pushSystem("Something went wrong while searching! " + err);
    }

    setIsLoading(false);
  };

  const handleProductSelect = async (product: Product) => {
    console.log("Product selected:", product);
    setPendingProduct(product);

    setShowPhonePopup(true);
    pushSystem(
      `Selected product for ${product.price}. Please enter your mobile number to continue.`
    );
  };

  const handlePhoneSubmit = async () => {
    console.log("STEP 03: Phone number submitted:", phone);

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingPhone(true);

    try {
      setShowPhonePopup(false);

      if (pendingProduct) {
        if (isClothingSearch) {
          pushSystem(
            `Mobile number collected. Please select a size for your product.`
          );
          setShowSizePopup(true);
        } else {
          pushSystem(`Mobile number collected. Adding to cart...`);
          await handleAddToCart();
        }
      }
    } catch (err) {
      console.log("STEP 03: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingPhone(false);
  };

  const handleSizeSelect = async () => {
    console.log("STEP 04: Size selected:", selectedSize);

    if (isClothingSearch && !selectedSize) {
      alert("Please select a size");
      return;
    }

    if (!pendingProduct || !pendingProduct.product_url) {
      pushSystem("Product information is missing. Please select again.");
      return;
    }

    setShowSizePopup(false);
    pushSystem(
      isClothingSearch
        ? `Size ${selectedSize} selected. Adding to cart...`
        : "Adding to cart..."
    );

    await handleAddToCart();
  };

  const handleAddToCart = async () => {
    if (loadingCart) return;

    console.log("STEP 02: Add to cart triggered for product:", pendingProduct);

    if (!pendingProduct) {
      pushSystem("Please select a product first.");
      return;
    }

    if (!phone) {
      setShowPhonePopup(true);
      return;
    }

    if (isClothingSearch && !selectedSize) {
      setShowSizePopup(true);
      return;
    }

    if (!pendingProduct.product_url) {
      pushSystem("Product URL is missing. Please select another product.");
      return;
    }

    setLoadingCart(true);

    try {
      console.log(`${phone} ${pendingProduct.product_url} ${selectedSize}`);
      const res = await fetch(`${BaseURL}/api/flipkart/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_url: pendingProduct.product_url,
          product_title: pendingProduct.title,
          phone_number: phone,
          size_label: isClothingSearch ? selectedSize : "",
        }),
      });

      const data = await res.json();
      console.log("STEP 02.1: Add to cart API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 02.2: Session ID updated to:", data.session_id);
      }

      if (
        isClothingSearch &&
        data.sizes &&
        Array.isArray(data.sizes) &&
        data.sizes.length > 0
      ) {
        console.log("STEP 02.3: Sizes received from API:", data.sizes);
        setAvailableSizes(data.sizes);

        if (!selectedSize) {
          pushSystem("Please select a size from the available options.");
          setShowSizePopup(true);
          return;
        }
      }

      if (
        data.status === "success" ||
        data.message?.includes("OTP screen reached")
      ) {
        console.log("STEP 02.4: Add to cart successful, OTP required");
        pushSystem(
          "Item added to cart successfully! OTP verification required."
        );
        setShowOtpPopup(true);
      } else if (data.status === "otp_required" || data.requires_otp) {
        console.log("STEP 02.5: OTP required");
        pushSystem("OTP verification required to add item to cart.");
        setShowOtpPopup(true);
      } else {
        console.log("STEP 02.6: Unknown response");
        pushSystem("Processing your request...");
        setTimeout(() => setShowAddressPopup(true), 500);
      }
    } catch (err) {
      console.log("STEP 02: Error:", err);
      pushSystem("Failed to add item to cart!");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleOtpSubmit = async () => {
    console.log("STEP 04: OTP workflow started");
    console.log("STEP 04.1: OTP entered:", otp);

    if (!otp.trim() || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoadingOtp(true);

    try {
      const res = await fetch(`${BaseURL}/api/flipkart/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      const data = await res.json();
      console.log("STEP 04.3: OTP API response:", data);

      if (data.status === "success") {
        console.log("STEP 04.4: OTP verification successful");
        setShowOtpPopup(false);

        if (
          data.addresses &&
          Array.isArray(data.addresses) &&
          data.addresses.length > 0
        ) {
          setAddresses(data.addresses);

          const defaultAddress = data.addresses.find(
            (addr: AddressFromAPI) => addr.is_default
          );
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].address_id);
          }

          pushSystem(
            "OTP verified successfully! Please select a shipping address."
          );
          setShowAddressPopup(true);
        } else {
          pushSystem(
            "OTP verified successfully! No addresses found in your account. Please add a new address."
          );
          setShowAddressPopup(true);
        }
      }
    } catch (err) {
      console.log("STEP 04: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleBuyWithNewAddress = async () => {
    if (loadingBuy) return;

    console.log("STEP 05: Buy workflow with new address");

    if (
      !address.name ||
      !address.phone ||
      !address.pincode ||
      !address.address_line1
    ) {
      alert("Please fill all address fields");
      return;
    }

    setLoadingBuy(true);

    try {
      const res = await fetch(`${BaseURL}/api/flipkart/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          address_id: "",
          name: address.name,
          phone: address.phone,
          pincode: address.pincode,
          locality: address.locality,
          address_line1: address.address_line1,
        }),
      });

      const data = await res.json();
      console.log("Buy API response with new address:", data);

      if (data.status === "success" || data.message?.includes("success")) {
        console.log("Order placed successfully");
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Order placed successfully! Please complete the payment.");

        setAddress({
          name: "",
          phone: "",
          pincode: "",
          locality: "",
          address_line1: "",
        });
      } else {
        console.log("Order failed");
        pushSystem("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.log("Error:", err);
      pushSystem("Failed to place order!");
    } finally {
      setLoadingBuy(false);
    }
  };
  const handleBuy = async () => {
    if (loadingBuy) return;

    console.log("STEP 05: Buy workflow started");
    console.log("Selected address ID:", selectedAddressId);

    if (!selectedAddressId) {
      alert("Please select an address");
      return;
    }

    setLoadingBuy(true);

    try {
      const res = await fetch(`${BaseURL}/api/flipkart/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          address_id: selectedAddressId == "current" ? "" : selectedAddressId,
        }),
      });

      const data = await res.json();
      console.log("STEP 05.1: Buy API response:", data);

      if (data.status === "success" || data.message?.includes("success")) {
        console.log("STEP 05.2: Order placed successfully");
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Order placed successfully! Please complete the payment.");
      } else {
        console.log("STEP 05.3: Order failed");
        pushSystem("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.log("STEP 05: Error:", err);
      pushSystem("Failed to place order!");
    } finally {
      setLoadingBuy(false);
    }
  };
  const handleUpiSubmit = async () => {
    if (loadingPayment) return;

    console.log("STEP 06: UPI payment workflow started");

    if (!upiId.trim()) {
      alert("Please enter your UPI ID");
      return;
    }

    setLoadingPayment(true);

    try {
      const res = await fetch(`${BaseURL}/api/flipkart/submit-upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          upi_id: upiId,
        }),
      });

      const data = await res.json();
      console.log("STEP 06.1: UPI API response:", data);

      if (data.status === "success" || data.message?.includes("success")) {
        console.log("STEP 06.2: Payment successful");
        setShowUpiPopup(false);
        pushSystem(
          JSON.stringify({
            type: "order_success",
            message:
              "Payment successful! Your Flipkart order has been confirmed.",
          })
        );
      } else {
        console.log("STEP 06.3: Payment failed");
        pushSystem("Payment failed. Please try again.");
      }
    } catch (err) {
      console.log("STEP 06: Error:", err);
      pushSystem("Payment failed!");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim()) {
      console.log("Empty message, stopping.");
      return;
    }

    setShowChat(true);
    const userText = messageInput;
    setMessageInput("");

    await handleSearch(userText);
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
          <h3 className="text-lg font-semibold mb-2">
            Here are some products from Flipkart:
          </h3>

          <div className="max-w-6xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              {parsed.products?.slice(0, 18).map((p: any, index: number) => {
                const key = p.product_url + index;
                const isSelected =
                  pendingProduct &&
                  pendingProduct.product_url === p.product_url;

                return (
                  <div
                    key={key}
                    onClick={() => handleProductSelect(p)}
                    className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-colors ${
                      isSelected ? "bg-[#1e1416]" : "hover:bg-[#151622]"
                    }`}
                  >
                    {p.image && (
                      <div className="relative w-full h-52 bg-gray-800">
                        <img
                          src={p.image}
                          alt={p.title || "Product image"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        {p.rating && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                            <span className="text-yellow-300">⭐</span>
                            <span className="text-white font-medium">
                              {p.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                      <div className="min-h- space-y-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {p.title || lastSearchQuery || "Flipkart Product"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-2">
                          {p.price && (
                            <p className="text-base font-bold text-white">
                              {p.price}
                            </p>
                          )}
                          {p.original_price && p.original_price !== p.price && (
                            <p className="text-xs text-gray-400 line-through">
                              {p.original_price}
                            </p>
                          )}
                        </div>
                        {p.discount && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-500/40">
                            {p.discount}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end mt-2">
                        <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">
                          Select Product
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
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
    } else if (typeof parsed === "object" && parsed?.type === "order_success") {
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
              {parsed.message ||
                "Your Flipkart order has been placed successfully!"}
            </p>
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
          } max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ALL POPUPS */}

      {/* PHONE POPUP */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Enter Phone Number
            </h2>
            <p className="text-sm text-gray-400">
              We need your phone number to add items to cart
            </p>

            <input
              type="tel"
              placeholder="10-digit Mobile Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handlePhoneSubmit}
              disabled={loadingPhone}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPhone ? <PopupLoader /> : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* SIZE POPUP */}
      {showSizePopup && pendingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Select Size</h2>

            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-300">
                {pendingProduct.title || "Product"}
              </p>
              <p className="text-green-400 font-semibold mt-1">
                {pendingProduct.price}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Use sizes from API response if available, otherwise use default sizes */}
              {(availableSizes.length > 0
                ? availableSizes
                : ["S", "M", "L", "XL", "XXL"]
              ).map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? "border-red-500 bg-red-500/20 text-white"
                      : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={handleSizeSelect}
              disabled={(isClothingSearch && !selectedSize) || loadingCart}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loadingCart ? (
                <PopupLoader />
              ) : isClothingSearch ? (
                "Add to Cart"
              ) : (
                "Continue"
              )}
            </button>

            {/* Add a skip button for non-clothing items just in case */}
            {!isClothingSearch && (
              <button
                onClick={async () => {
                  setShowSizePopup(false);
                  await handleAddToCart();
                }}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold mt-2"
              >
                Skip Size Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* OTP POPUP */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
            <p className="text-sm text-gray-400">Enter OTP sent to {phone}</p>

            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
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

      {/* ADDRESS SELECTION POPUP */}
      {showAddressPopup && addresses.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Select Shipping Address
            </h2>
            <p className="text-sm text-gray-400">
              Choose an address from your Flipkart account
            </p>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.address_id}
                  onClick={() => setSelectedAddressId(addr.address_id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr.address_id
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAddressId === addr.address_id
                          ? "border-red-500 bg-red-500"
                          : "border-gray-500"
                      }`}
                    >
                      {selectedAddressId === addr.address_id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white">
                          {addr.name}
                        </h3>
                        {addr.is_default && (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{addr.phone}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {addr.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAddressPopup(false);
                  pushSystem("Address selection cancelled.");
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={!selectedAddressId || loadingBuy}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingBuy ? <PopupLoader /> : "Use This Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddressPopup && addresses.length === 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Add Shipping Address
            </h2>
            <p className="text-sm text-gray-400">
              No addresses found in your account. Please add a new address.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Locality/Area"
                value={address.locality}
                onChange={(e) =>
                  setAddress({ ...address, locality: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <textarea
                placeholder="Full Address (House No, Building, Street)"
                value={address.address_line1}
                onChange={(e) =>
                  setAddress({ ...address, address_line1: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none min-h-[80px]"
                rows={3}
              />
            </div>

            <button
              onClick={handleBuyWithNewAddress}
              disabled={loadingBuy}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingBuy ? <PopupLoader /> : "Save Address & Place Order"}
            </button>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Complete Payment
            </h2>
            <p className="text-sm text-gray-400">
              Enter your UPI ID to pay {pendingProduct?.price}
            </p>

            <input
              type="text"
              placeholder="UPI ID (e.g., name@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />

            <button
              onClick={handleUpiSubmit}
              disabled={loadingPayment}
              className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
                placeholder="Search for products on Flipkart..."
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
          {/* Sidebar */}
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
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-semibold">
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
                    Welcome to Flipkart Shopping!
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg">
                    Search for any product you want to buy
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
                    placeholder="Search for products on Flipkart..."
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

                {/* Card */}
                <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
                  <Link
                    to="/flipkart"
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Flipkart Shopping
                    </h3>
                    <p className="text-sm text-gray-400">
                      Search and buy products from Flipkart with voice commands
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
