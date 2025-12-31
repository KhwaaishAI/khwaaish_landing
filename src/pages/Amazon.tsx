import React, { useState } from "react";
import { Link } from "react-router-dom";
// const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
const BaseURL = import.meta.env.DEV ? "" : "https://api.khwaaish.com";

import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const buildApiUrl = (path: string) => {
  const base = (BaseURL || "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

interface Product {
  name?: string;
  title?: string;
  price?: string;
  product_url?: string;
  image_url?: string;
  rating?: string;
  reviews_count?: string;
}

interface ProductDetails {
  title?: string;
  price?: string;
  available_sizes?: string[];
  color?: string;
  image_urls?: string[];
  about_item?: string[];
}

interface Address {
  full_name: string;
  mobile_number: string;
  pincode: string;
  house_no: string;
  area: string;
  landmark: string;
}

export default function Amazon() {
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
  const [showProductDetails, setShowProductDetails] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [upiId, setUpiId] = useState("");
  const [address, setAddress] = useState<Address>({
    full_name: "",
    mobile_number: "",
    pincode: "",
    house_no: "",
    area: "",
    landmark: "",
  });

  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );
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
      const response = await fetch(buildApiUrl("/amazon/search-amazon"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Search request failed (${response.status}). ${text || ""}`.trim()
        );
      }

      const data = await response.json();
      console.log("STEP 01.2: Search API response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
        console.log("STEP 01.3: Session ID updated to:", data.session_id);
      }

      const products =
        data?.results || data?.products || data?.data?.products || [];
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

    // Fetch product details first
    setLoadingDetails(true);

    try {
      const response = await fetch(buildApiUrl("/amazon/get-product-details"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          product_url: product.product_url,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Product details request failed (${response.status}). ${
            text || ""
          }`.trim()
        );
      }

      const data = await response.json();
      console.log("Product details response:", data);

      if (data.status === "success" && data.details) {
        setProductDetails(data.details);
        setAvailableSizes(data.details.available_sizes || []);

        // Show product details in chat
        pushSystem(
          JSON.stringify({
            type: "product_details",
            details: data.details,
            product: product,
          })
        );

        // Show phone popup
        setShowPhonePopup(true);
        pushSystem(
          `Selected ${product.name || "product"} for ${
            product.price
          }. Please enter your mobile number to continue.`
        );
      }
    } catch (err) {
      console.log("Error fetching product details:", err);
      pushSystem("Failed to load product details. Please try again.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePhoneSubmit = async () => {
    console.log("STEP 03: Phone number submitted:", phone);

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingPhone(true);

    try {
      const res = await fetch(buildApiUrl("/amazon/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          phone: phone,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Login request failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const data = await res.json();
      console.log("Login API response:", data);

      setShowPhonePopup(false);

      if (data.status === "success") {
        // Check if we need to show size selection for clothing items
        if (isClothingSearch && availableSizes.length > 0) {
          pushSystem(
            `Mobile number verified. Please select a size for your product.`
          );
          setShowSizePopup(true);
        } else {
          // For non-clothing items, proceed directly to add-to-cart
          pushSystem(`Mobile number verified. Adding to cart...`);
          await handleAddToCart();
        }
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (err) {
      console.log("Login Error:", err);
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

    console.log("STEP 02: Add to cart triggered");

    if (!sessionId) {
      pushSystem("Session expired. Please try again.");
      return;
    }

    setLoadingCart(true);

    try {
      const res = await fetch(buildApiUrl("/amazon/add-to-cart"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          size: isClothingSearch ? selectedSize : "",
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Add to cart request failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const data = await res.json();
      console.log("Add to cart API response:", data);

      if (data.status === "success") {
        console.log("Add to cart successful");
        pushSystem(
          data.message || "Item added to cart successfully! Please verify OTP."
        );
        setShowOtpPopup(true);
      } else {
        pushSystem("Failed to add item to cart. Please try again.");
      }
    } catch (err) {
      console.log("Add to cart Error:", err);
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
      const res = await fetch(buildApiUrl("/amazon/submit-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Submit OTP request failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const data = await res.json();
      console.log("OTP API response:", data);

      if (data.status === "success") {
        console.log("OTP verification successful");
        setShowOtpPopup(false);
        pushSystem(
          "OTP verified successfully! Please provide shipping address."
        );
        setShowAddressPopup(true);
      } else {
        console.log("OTP verification failed");
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.log("OTP Error:", err);
      alert("Something went wrong!");
    }

    setLoadingOtp(false);
  };

  const handleAddressSubmit = async () => {
    if (loadingBuy) return;

    console.log("STEP 05: Address submission");

    // Validate address
    if (
      !address.full_name ||
      !address.mobile_number ||
      !address.pincode ||
      !address.house_no ||
      !address.area
    ) {
      alert("Please fill all required address fields");
      return;
    }

    setLoadingBuy(true);

    try {
      const res = await fetch(buildApiUrl("/amazon/add-address"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          full_name: address.full_name,
          mobile_number: address.mobile_number,
          pincode: address.pincode,
          house_no: address.house_no,
          area: address.area,
          landmark: address.landmark,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Add address request failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const data = await res.json();
      console.log("Address API response:", data);

      if (data.status === "success") {
        console.log("Address added successfully");
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Address saved successfully! Please complete the payment.");
      } else {
        console.log("Address failed");
        pushSystem("Failed to save address. Please try again.");
      }
    } catch (err) {
      console.log("Address Error:", err);
      pushSystem("Failed to save address!");
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
      const res = await fetch(buildApiUrl("/amazon/pay-with-upi"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          upi_id: upiId,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `UPI payment request failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const data = await res.json();
      console.log("UPI API response:", data);

      if (data.status === "success") {
        console.log("Payment successful");
        setShowUpiPopup(false);
        pushSystem(
          JSON.stringify({
            type: "order_success",
            message:
              "Payment successful! Your Amazon order has been confirmed.",
          })
        );
      } else {
        console.log("Payment failed");
        pushSystem("Payment failed. Please try again.");
      }
    } catch (err) {
      console.log("Payment Error:", err);
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
            Here are some products from Amazon:
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
                    {p.image_url && (
                      <div className="relative w-full h-52 bg-gray-800">
                        <img
                          src={p.image_url}
                          alt={p.name || "Product image"}
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
                      <div className="min-h-[60px] space-y-1">
                        <p className="text-sm font-semibold text-white line-clamp-2">
                          {p.name || lastSearchQuery || "Amazon Product"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-2">
                          {p.price && (
                            <p className="text-base font-bold text-white">
                              {p.price}
                            </p>
                          )}
                        </div>
                        {p.reviews_count && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/40">
                            {p.reviews_count}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end mt-2">
                        <button className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">
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
      parsed?.type === "product_details"
    ) {
      const details = parsed.details;
      const product = parsed.product;

      content = (
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white">Product Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.image_urls && details.image_urls.length > 0 && (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={details.image_urls[0]}
                    alt={details.title || "Product image"}
                    className="w-full h-full object-contain"
                  />
                </div>
                {details.image_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {details.image_urls
                      .slice(0, 4)
                      .map((url: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={url}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-400">Title</h4>
                <p className="text-white">
                  {details.title?.trim() || product?.name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">Price</h4>
                <p className="text-xl font-bold text-yellow-400">
                  {details.price || product?.price}
                </p>
              </div>

              {details.color && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Color</h4>
                  <p className="text-white">{details.color.trim()}</p>
                </div>
              )}

              {details.available_sizes &&
                details.available_sizes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">
                      Available Sizes
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {details.available_sizes.map((size: string) => (
                        <span
                          key={size}
                          className="px-3 py-1 bg-gray-800 rounded-lg text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {details.about_item && details.about_item.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400">
                    About this item
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-1">
                    {details.about_item.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                "Your Amazon order has been placed successfully!"}
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

    return typeof parsed === "object" &&
      (parsed?.type === "product_list" ||
        parsed?.type === "product_details") ? (
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
              We need your phone number to login to Amazon
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
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
                {pendingProduct.name || "Product"}
              </p>
              <p className="text-yellow-400 font-semibold mt-1">
                {pendingProduct.price}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(availableSizes.length > 0
                ? availableSizes
                : ["S", "M", "L", "XL", "XXL"]
              ).map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? "border-yellow-500 bg-yellow-500/20 text-white"
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
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loadingCart ? (
                <PopupLoader />
              ) : isClothingSearch ? (
                "Add to Cart"
              ) : (
                "Continue"
              )}
            </button>

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
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingOtp ? <PopupLoader /> : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS POPUP */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white">
              Shipping Address
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={address.full_name}
                onChange={(e) =>
                  setAddress({ ...address, full_name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={address.mobile_number}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    mobile_number: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
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
                placeholder="House No, Building"
                value={address.house_no}
                onChange={(e) =>
                  setAddress({ ...address, house_no: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Area, Street"
                value={address.area}
                onChange={(e) =>
                  setAddress({ ...address, area: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={address.landmark}
                onChange={(e) =>
                  setAddress({ ...address, landmark: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
              />
            </div>

            <button
              onClick={handleAddressSubmit}
              disabled={loadingBuy}
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingBuy ? <PopupLoader /> : "Save Address & Continue"}
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
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
            {loadingDetails && (
              <div className="flex justify-start">
                <div className="bg-gray-900/80 text-gray-100 border-gray-800 max-w-[85%] rounded-2xl px-4 py-3 border">
                  <div className="flex items-center gap-3">
                    <PopupLoader />
                    <span>Loading product details...</span>
                  </div>
                </div>
              </div>
            )}
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
                placeholder="Search for products on Amazon..."
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
                    ? "bg-yellow-500 hover:bg-yellow-600"
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
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
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
                    Welcome to Amazon Shopping!
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
                    placeholder="Search for products on Amazon..."
                    className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleSend()}
                      className={`p-2 ${
                        messageInput
                          ? "bg-yellow-500 hover:bg-yellow-600"
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
                    to="/amazon"
                    className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-black"
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
                      Amazon Shopping
                    </h3>
                    <p className="text-sm text-gray-400">
                      Search and buy products from Amazon
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
