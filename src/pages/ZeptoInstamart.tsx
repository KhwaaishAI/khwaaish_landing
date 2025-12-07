import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
}

export default function Chat1() {
  const [selectedUpi, setSelectedUpi] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [showUpiPopup, setShowUpiPopup] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [loadingUpi, setLoadingUpi] = useState(false);

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [otp, setOtp] = useState("");
  const [zeptoSessionId, setZeptoSessionId] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  const [pendingCartSelections, setPendingCartSelections] = useState<any>(null);
  const [cartSelections, setCartSelections] = useState<{
    [id: string]: { quantity: number; product: any };
  }>({});
  const [holdSeconds] = useState(59);

  const [instamartOtp, setInstamartOtp] = useState("");
  const [instamartSessionId, setInstamartSessionId] = useState("");
  const [loadingInstamartCart, setLoadingInstamartCart] = useState(false);

  const [showInstamartAddressPopup, setShowInstamartAddressPopup] =
    useState(false);
  const [instamartDoorNo, setInstamartDoorNo] = useState("");
  const [instamartLandmark, setInstamartLandmark] = useState("");
  const [loadingInstamartBook, setLoadingInstamartBook] = useState(false);
  const [instamartCartItems, setInstamartCartItems] = useState<any[]>([]);

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [allProductsList, setAllProductsList] = useState([]);

  const zeptoInputRef = useRef<HTMLInputElement>(null);
  const instamartInputRef = useRef<HTMLInputElement>(null);

  const UPI_DOMAINS = [
    "@ybl",
    "@ibl",
    "@okicici",
    "@oksbi",
    "@okhdfcbank",
    "@paytm",
    "@pthdfc",
    "@upi",
    "@idfcbank",
    "@kotak",
    "@axl",
    "@sbi",
    "@kbl",
  ];

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

  const uselocation = useLocation();
  const { userInput } = uselocation.state || {};

  // Auto-send when component mounts with userInput
  useEffect(() => {
    if (userInput && userInput.trim() && !hasShownLoginPrompt) {
      // Set the message input
      setShowChat(true);

      // Show user's message immediately
      pushUser(userInput);

      // Set message input to empty
      setMessageInput(userInput);

      setIsLoading(true);

      // Wait 2 seconds, then show login prompt
      const timer = setTimeout(() => {
        showLoginPrompt();
      }, 2000);
    }
  }, []);

  // Function to show login prompt
  const showLoginPrompt = () => {
    if (!hasShownLoginPrompt) {
      setIsLoading(false);

      pushSystem("To proceed further, please login to your account.");
      setShowLoginButton(true);
      setHasShownLoginPrompt(true);
    }
  };

  // Handle login button click
  const handleLoginClick = () => {
    setShowPhonePopup(true);
    setShowLoginButton(false);
  };

  const handleLogin = async () => {
    console.log("STEP 01: Login Workflow Started");
    console.log("STEP 01.1: Phone:", phone, " Location:", location);

    if (!phone.trim() || !location.trim()) {
      console.log("STEP 01.2: Missing phone or location");
      return;
    }

    setLoadingPhone(true);
    console.log("STEP 01.3 Login API request sending...");

    try {
      const zeptoPayload = {
        mobile_number: phone,
        location: location,
      };

      const instamartPayload = {
        mobile_number: phone,
        name: "Khwaaish User",
        gmail: "user@khwaaish.com",
        location: location,
      };

      const zeptoLogin = fetch(`${BaseURL}api/zepto/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zeptoPayload),
      });

      const instamartLogin = fetch(`${BaseURL}api/instamart/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instamartPayload),
      });

      console.log("STEP 01.4: Calling both the APIs parallelly...");

      const [zeptoRes, instamartRes] = await Promise.all([
        zeptoLogin,
        instamartLogin,
      ]);

      const [zeptoData, instamartData] = await Promise.all([
        zeptoRes.json(),
        instamartRes.json(),
      ]);

      console.log("STEP 01.5: Login API response:", zeptoData, instamartData);

      if (zeptoData.session_id && instamartData.session_id) {
        setZeptoSessionId(zeptoData.session_id);
        setInstamartSessionId(instamartData.session_id);
        setShowPhonePopup(false);
        setShowOtpPopup(true);
      }
    } catch (err) {
      console.log("STEP 01: Error:", err);
      alert("Something went wrong!");
    }

    setLoadingPhone(false);
  };

  const handleOtpSubmit = async () => {
    console.log("STEP 02: OTP workflow started");
    console.log("STEP 02.1: Zepto OTP entered:", otp);
    console.log("STEP 02.2: Instamart OTP entered:", instamartOtp);

    if (!otp.trim()) {
      console.log("STEP 02.2: Missing OTP");
      return;
    }
    setLoadingOtp(true);
    console.log("STEP 02.3: Both OTP API request sending...");

    try {
      const zeptoOtpRes = fetch(`${BaseURL}api/zepto/enter-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: zeptoSessionId,
          otp: otp,
        }),
      });

      const instamartOtpRes = fetch(`${BaseURL}api/instamart/submit-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: instamartSessionId,
          otp: otp,
        }),
      });

      const [zeptoRes, instamartRes] = await Promise.all([
        zeptoOtpRes,
        instamartOtpRes,
      ]);

      const [zeptoData, instamartData] = await Promise.all([
        zeptoRes.json(),
        instamartRes.json(),
      ]);

      console.log("STEP 02.4: OTP API response:", zeptoRes, instamartRes);

      if (
        zeptoData.status === "success" &&
        instamartData.status === "success"
      ) {
        console.log("STEP 02.5: OTP verification successful");
        setShowOtpPopup(false);
      }

      handleSend();
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

    // pushUser(messageInput);

    const userText = messageInput;
    setMessageInput("");
    setIsLoading(true);

    console.log("STEP 03.2: Search API request sending...");

    try {
      const zeptoPayload = {
        query: userText,
        max_items: 20,
      };

      const instamartPayload = {
        query: userText,
      };

      const [zeptoRes, instamartRes] = await Promise.all([
        fetch(`${BaseURL}api/zepto/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zeptoPayload),
        }),
        fetch(`${BaseURL}api/instamart/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(instamartPayload),
        }),
      ]);

      const [zeptoData, instamartData] = await Promise.all([
        zeptoRes.json(),
        instamartRes.json(),
      ]);

      console.log("STEP 03.3: Search API response:", zeptoData, instamartData);

      if (zeptoData.session_id) {
        console.log(
          "STEP 03.4: Zepto Session ID updated to:",
          zeptoData.session_id
        );
        setZeptoSessionId(zeptoData.session_id);
      }
      if (instamartData.session_id) {
        console.log(
          "STEP 03.4: Instamart Session ID updated to:",
          instamartData.session_id
        );
        setInstamartSessionId(instamartData.session_id);
      }

      console.log("STEP 03.5: Extracting actual product list from response");

      const zeptoProducts = zeptoData.products;

      const instamartProducts = instamartData.results;

      const zeptoProductsWithSource = zeptoProducts.map((product: any) => ({
        ...product,
        source: "zepto",
      }));

      const instamartProductsWithSource = instamartProducts.map(
        (product: any) => ({
          ...product,
          source: "instamart",
        })
      );

      let productList = [
        ...zeptoProductsWithSource,
        ...instamartProductsWithSource,
      ];

      console.log("STEP 03.7: Extracted productList =", productList);
      setAllProductsList(productList);
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
    if (loadingCart || loadingInstamartCart) return;

    console.log("STEP 04: handleConfirmCart() triggered with:", cartSelections);

    const zeptoItems: { product: any; quantity: number }[] = [];
    const instamartItems: { product: any; quantity: number }[] = [];

    Object.values(cartSelections).forEach((item) => {
      if (item.quantity > 0) {
        if (item.product.source === "zepto") {
          zeptoItems.push({ product: item.product, quantity: item.quantity });
        } else if (item.product.source === "instamart") {
          instamartItems.push({
            product: item.product,
            quantity: item.quantity,
          });
        }
      }
    });

    if (zeptoItems.length === 0 && instamartItems.length === 0) {
      pushSystem("Please select at least one item.");
      return;
    }

    console.log(
      `Found ${zeptoItems.length} Zepto items, ${instamartItems.length} Instamart items`
    );

    const currentCart = { ...cartSelections };

    if (zeptoItems.length > 0 && !upiId) {
      console.log("Zepto items found but no UPI ID, showing UPI popup");
      setPendingCartSelections(currentCart);
      setShowUpiPopup(true);
    }

    if (zeptoItems.length > 0) {
      console.log("Processing Zepto items:", zeptoItems);
      await processZeptoCart(zeptoItems);
    }

    if (instamartItems.length > 0) {
      console.log("Processing Instamart items:", instamartItems);
      await processInstamartCart(instamartItems);
    }

    if (zeptoItems.length > 0 && instamartItems.length === 0) {
      setCartSelections({});
    }
  };

  const processZeptoCart = async (
    items: { product: any; quantity: number }[]
  ) => {
    setLoadingCart(true);
    console.log("STEP 04.3: Processing Zepto cart...");

    try {
      for (const item of items) {
        const endpoint = "zepto/add-to-cart";
        const payload = {
          product_name: item.product.name,
          quantity: item.quantity,
          upi_id: upiId,
          hold_seconds: holdSeconds,
        };

        console.log("Zepto API request:", payload);

        const res = await fetch(`${BaseURL}api/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Zepto API response:", data);

        if (data === null || data.order_placed) {
          pushSystem(
            JSON.stringify({
              status: "success",
              message: `Your Zepto order for ${item.product.name} has been completed!`,
            })
          );
        } else if (
          data.status === "error" &&
          data.message === "Cart is empty."
        ) {
          pushSystem(`Zepto item "${item.product.name}" is Out of Stock now!`);
        } else {
          pushSystem(JSON.stringify(data));
        }
      }
    } catch (err) {
      console.log("Zepto cart error:", err);
      pushSystem(`Payment Request Sent to your UPI ID for Zepto items`);
    } finally {
      setLoadingCart(false);
    }
  };

  const processInstamartCart = async (
    items: { product: any; quantity: number }[]
  ) => {
    setLoadingInstamartCart(true);
    console.log("STEP 04.4: Processing Instamart cart...");

    try {
      setInstamartCartItems(items);

      for (const item of items) {
        const payload = {
          quantity: item.quantity,
          session_id: instamartSessionId,
        };

        console.log("Instamart add-to-cart API request:", payload);

        const res = await fetch(`${BaseURL}api/instamart/add-to-cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Instamart add-to-cart API response:", data);

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
    console.log("STEP 05: Booking Instamart order...");

    try {
      const bookPayload = {
        session_id: instamartSessionId,
        door_no: instamartDoorNo,
        landmark: instamartLandmark,
        upi_id: upiId,
      };

      console.log("Step 2: Booking Instamart order:", bookPayload);

      const bookRes = await fetch(`${BaseURL}api/instamart/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookPayload),
      });

      const bookData = await bookRes.json();
      console.log("Instamart book API response:", bookData);

      if (bookData.status === "success") {
        pushSystem("Your Instamart order has been booked successfully!");

        setInstamartCartItems([]);
        setInstamartDoorNo("");
        setInstamartLandmark("");
        setShowInstamartAddressPopup(false);

        setCartSelections((prev) => {
          const newSelections = { ...prev };
          Object.keys(newSelections).forEach((key) => {
            if (key.includes("instamart")) {
              delete newSelections[key];
            }
          });
          return newSelections;
        });
      } else {
        pushSystem(
          `Instamart booking failed: ${bookData.message || "Unknown error"}`
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

  const handleUpiSubmit = async () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID");
      return;
    }

    setLoadingUpi(true);
    console.log("Submitting UPI ID...", upiId);

    try {
      setShowUpiPopup(false);

      if (pendingCartSelections) {
        pushSystem("UPI ID collected. Placing your Zepto order...");

        const zeptoItems: { product: any; quantity: number }[] = [];

        Object.values(pendingCartSelections).forEach((item: any) => {
          if (item.quantity > 0 && item.product.source === "zepto") {
            zeptoItems.push({ product: item.product, quantity: item.quantity });
          }
        });

        if (zeptoItems.length > 0) {
          await processZeptoCart(zeptoItems);
        }

        setPendingCartSelections(null);

        setCartSelections({});
      }
    } catch (err) {
      console.log("Error submitting UPI ID:", err);
      alert("Something went wrong while submitting UPI ID.");
    } finally {
      setLoadingUpi(false);
    }
  };

  const handleAddToCart = (product: any) => {
    const key = `${product.name}|${product.price}|${product.source}`;
    setCartSelections((prev) => {
      const current = prev[key] || {
        quantity: 0,
        product: product,
      };
      return {
        ...prev,
        [key]: {
          ...current,
          quantity: current.quantity + 1,
          product: product,
        },
      };
    });
  };

  const handleIncreaseQuantity = (key: string) => {
    setCartSelections((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          ...current,
          quantity: current.quantity + 1,
        },
      };
    });
  };

  const handleDecreaseQuantity = (key: string) => {
    setCartSelections((prev) => {
      const current = prev[key];
      if (!current || current.quantity <= 1) {
        const newSelections = { ...prev };
        delete newSelections[key];
        return newSelections;
      }
      return {
        ...prev,
        [key]: {
          ...current,
          quantity: current.quantity - 1,
        },
      };
    });
  };

  const renderMessage = (m: Message) => {
    let parsed: any;

    try {
      parsed = JSON.parse(m.content);
    } catch {
      parsed = m.content;
    }

    let content: React.ReactNode = null;

    if (
      parsed === "To proceed further, please login to your account." &&
      showLoginButton
    ) {
      content = (
        <div className="space-y-3">
          <p>{parsed}</p>
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold"
          >
            Login
          </button>
        </div>
      );
    } else if (typeof parsed === "object" && parsed?.type === "product_list") {
      content = (
        <div className="space-y-6">
          {/* Title */}
          <h3 className="text-lg font-semibold">
            Here are the few best deals we got for you
          </h3>

          {/* Group by source */}
          {["zepto", "instamart"].map((source) => {
            const items = parsed.products?.filter(
              (p: any) => p.source === source
            );

            if (!items?.length) return null;

            return (
              <div key={source} className="space-y-4 flex ">
                <div className="flex flex-col w-[78%]">
                  {/* Source Heading */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-white font-bold ${
                        source === "zepto" ? "bg-[#7B3FFD]" : "bg-green-500"
                      }`}
                    >
                      {source === "zepto" ? (
                        <img src="/zepto.png" alt="" />
                      ) : (
                        <img src="/instamart.png" alt="" />
                      )}
                    </span>
                    <h2 className="text-lg font-semibold">
                      Best deals you can grab on{" "}
                      {source === "zepto" ? "Zepto" : "Swiggy Instamart"} right
                      now
                    </h2>
                  </div>

                  {/* Product horizontal scrollable list */}
                  <div className="flex gap-4 overflow-x-auto tailwind-scrollbar-hide pb-2">
                    {items.map((p: any) => {
                      const key = `${p.name}|${p.price}|${p.source}`;
                      const currentItem = cartSelections[key];
                      const qty = currentItem?.quantity || 0;

                      return (
                        <div
                          key={key}
                          className="min-w-[160px] bg-[#111] p-3 rounded-xl border border-gray-800 relative"
                        >
                          {/* Discount badge */}
                          {p.discount && (
                            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-[2px] rounded-md">
                              {p.discount}% OFF
                            </span>
                          )}

                          {/* Product image with + button overlay */}
                          <div className="relative">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-32 object-cover rounded-md bg-gray-900"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                            {/* + button on image */}
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="absolute bottom-2 right-2 w-8 h-8 bg-white text-black text-3xl rounded flex items-center justify-center transition-colors active:scale-95 shadow-lg"
                            >
                              +
                            </button>
                            {qty > 0 && (
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                                {qty} in cart
                              </div>
                            )}
                          </div>

                          {/* Delivery Time + Rating */}
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-gray-300">
                              {p.delivery_time || "24 min"}
                            </span>
                            <span className="bg-green-700/30 px-2 py-[2px] rounded text-green-400">
                              ⭐ 4.1
                            </span>
                          </div>

                          {/* Name */}
                          <p className="text-sm font-semibold mt-1 line-clamp-2">
                            {p.name}
                          </p>

                          {/* Price */}
                          <div className="mt-1">
                            <span className="font-bold text-white">
                              ₹{p.price}
                            </span>
                            {p.mrp && (
                              <span className="text-gray-400 line-through text-sm ml-2">
                                ₹{p.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Show All Products Button - Redesigned as card */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowAllProducts(true)}
                    className="min-w-[160px] mt-4 h-64 bg-[#111] p-3 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-2">
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-center">
                      View All Products
                    </span>
                    <span className="text-xs text-gray-400 text-center mt-1">
                      Browse full collection
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Cart Summary & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            {/* Cart Summary */}
            {Object.keys(cartSelections).length > 0 && (
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <h4 className="font-semibold text-xl mb-2">Selected Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(cartSelections).map(
                    ([key, item]: [string, any]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-14 w-14 bg-gray-800 rounded-md overflow-hidden">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.product.source === "zepto"
                                ? "Zepto"
                                : "Instamart"}
                            </p>
                            <div className="text-sm font-medium mt-1">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecreaseQuantity(key)}
                            className="w-10 h-10 text-2xl border border-gray-300 rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(key)}
                            className="w-10 h-10 text-2xl border border-gray-300 rounded flex items-center justify-center "
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Confirm Order Button */}
            <button
              onClick={handleConfirmCart}
              disabled={
                loadingCart ||
                loadingInstamartCart ||
                Object.keys(cartSelections).length === 0
              }
              className={`px-4 py-3 rounded-xl font-semibold mt-2 flex items-center justify-center gap-2 ${
                loadingCart ||
                loadingInstamartCart ||
                Object.keys(cartSelections).length === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              {loadingCart ? (
                <>
                  <PopupLoader /> Processing Zepto...
                </>
              ) : loadingInstamartCart ? (
                <>
                  <PopupLoader /> Processing Instamart...
                </>
              ) : Object.keys(cartSelections).length === 0 ? (
                "Add items to cart"
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
                  Confirm Order ({Object.keys(cartSelections).length} items)
                </>
              )}
            </button>
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
              : " text-gray-100 border-black"
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
      {showAllProducts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[99999]">
          <div className="w-1/3 bg-[#0E131F] h-full p-5 border-l border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Products</h2>
              <button
                onClick={() => setShowAllProducts(false)}
                className="text-gray-300 text-2xl hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Products Grid */}
            <div className="overflow-y-auto tailwind-scrollbar-hide h-[calc(100%-4rem)] pr-2">
              <div className="grid grid-cols-3 gap-4">
                {allProductsList.map((p: any, i) => {
                  const key = `${p.name}|${p.price}|${p.source}`;
                  const currentItem = cartSelections[key];
                  const qty = currentItem?.quantity || 0;

                  return (
                    <div
                      key={i}
                      className="bg-[#141923] p-4 rounded-xl border border-white/10 gap-4"
                    >
                      {/* Product Image with + button */}
                      <div className="relative">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-30 h-30 rounded-md object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML =
                              '<div class="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center text-gray-400">No Image</div>';
                          }}
                        />
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="absolute bottom-2 right-0 text-2xl w-8 h-8 bg-white text-black rounded flex items-center justify-center transition-colors active:scale-95 shadow-lg"
                        >
                          +
                        </button>
                        {qty > 0 && (
                          <div className="absolute -top-2 -left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
                            {qty}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-2">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-white">
                            ₹{p.price}
                          </span>
                          {p.mrp && (
                            <span className="text-gray-400 line-through text-sm">
                              ₹{p.mrp}
                            </span>
                          )}
                          {p.discount && (
                            <span className="text-green-400 text-xs bg-green-900/30 px-1.5 py-0.5 rounded">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                          <span>{p.delivery_time || "24 min"}</span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span>4.1</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              p.source === "zepto"
                                ? "bg-purple-900/30 text-purple-300"
                                : "bg-green-900/30 text-green-300"
                            }`}
                          >
                            {p.source === "zepto" ? "Zepto" : "Instamart"}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      {qty > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecreaseQuantity(key)}
                            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-medium w-8 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(key)}
                            className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHONE NUMBER POPUP */}
      {showPhonePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[#0E0E0E]  rounded-2xl p-5 border border-white/10 space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg  text-white">Sign in now</h2>

              <button onClick={() => setShowPhonePopup(false)}>
                <span className="text-white text-xl">&times;</span>
              </button>
            </div>

            {/* Map Image */}
            <div className="relative w-full">
              <img
                src="/MapImage.png"
                alt="Map"
                className="w-full h-full object-cover rounded"
              />
            </div>

            {/* Location Input */}
            <div className="space-y-1">
              <label className="text-gray-300 text-lg">Enter Location</label>
              <input
                type="text"
                placeholder="eg : Pune"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-3 rounded-lg bg-transparent text-lg border border-white/20 text-white placeholder-gray-500 outline-none"
              />
            </div>

            {/* Mobile Input */}
            <div className="space-y-1">
              <label className="text-gray-300 text-lg">Mobile Number</label>
              <input
                type="text"
                placeholder="Enter your mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-3 rounded-lg bg-transparent text-lg border border-white/20 text-white placeholder-gray-500 outline-none"
              />
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleLogin}
              disabled={loadingPhone}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-full text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPhone ? <PopupLoader /> : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* OTP POPUP */}
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[#0E131F] w-[360px] rounded-2xl border border-[#2A2F3A] p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                OTP Authentication
              </h2>
              <button
                onClick={() => setShowOtpPopup(false)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            {/* ---- ZEPTO SECTION ---- */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <img src="/zepto.png" className="w-6 h-6 rounded" />
                <span className="text-white font-medium">Zepto</span>
              </div>

              <p className="text-gray-400 text-sm mb-3">
                Enter the 6-digit OTP from Myntra
              </p>

              {/* ZEPTO OTP BOXES */}
              <div
                className="flex gap-3 mb-2"
                onClick={() => zeptoInputRef.current?.focus()}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl border border-[#2f3340] bg-[#1a1f2b] flex items-center justify-center text-white text-xl cursor-text"
                  >
                    {otp[i] || ""}
                  </div>
                ))}
              </div>

              {/* Hidden but focusable input */}
              <input
                ref={zeptoInputRef}
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="absolute w-0 h-0 opacity-0"
                autoFocus
              />

              <div className="border-b border-gray-700 mt-4"></div>
            </div>

            {/* ---- INSTAMART SECTION ---- */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <img src="/instamart.png" className="w-6 h-6 rounded" />
                <span className="text-white font-medium">Swiggy instamart</span>
              </div>

              <p className="text-gray-400 text-sm mb-3">
                Enter the 6-digit OTP from Nykaa
              </p>

              {/* OTP INPUT (single input, styled like boxes) */}
              {/* INSTAMART OTP BOXES */}
              <div
                className="flex gap-3 flex-wrap mb-2"
                onClick={() => instamartInputRef.current?.focus()}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl border border-[#2f3340] bg-[#1a1f2b] flex items-center justify-center text-white text-xl cursor-text"
                  >
                    {instamartOtp[i] || ""}
                  </div>
                ))}
              </div>

              {/* Hidden but focusable input */}
              <input
                ref={instamartInputRef}
                type="text"
                maxLength={6}
                value={instamartOtp}
                onChange={(e) =>
                  setInstamartOtp(e.target.value.replace(/\D/g, ""))
                }
                className="absolute w-0 h-0 opacity-0"
              />
            </div>

            {/* Button */}
            <button
              onClick={handleOtpSubmit}
              disabled={loadingOtp}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-full text-white font-semibold text-lg disabled:opacity-50"
            >
              {loadingOtp ? "..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {/* UPI POPUP */}
      {showUpiPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pt-6 z-[9999]">
          <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 max-h-[90vh] overflow-y-auto ">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Pay with UPI</h2>
              <button onClick={() => setShowUpiPopup(false)}>
                <span className="text-gray-400 text-xl">✕</span>
              </button>
            </div>

            {/* UPI Options */}
            <div className="space-y-5">
              {[
                {
                  id: "gpay",
                  name: "Google Pay",
                  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyVO9LUWF81Ov6LZR50eDNu5rNFCpkn0LwYQ&s",
                },
                {
                  id: "phonepe",
                  name: "PhonePe",
                  logo: "https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXJ93q6DZkmx07Er1o90PXYeo6mzL4VC2Gj9s",
                },
                {
                  id: "paytm",
                  name: "Paytm",
                  logo: "https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=w240-h480-rw",
                },
                {
                  id: "other",
                  name: "Other UPI",
                  logo: "https://images.seeklogo.com/logo-png/33/1/unified-payment-interface-upi-logo-png_seeklogo-333088.png",
                },
              ].map((opt) => {
                const isOpen = selectedUpi === opt.id;

                return (
                  <div key={opt.id} className="border-b border-white/10 pb-1">
                    {/* Row */}
                    <button
                      onClick={() => setSelectedUpi(opt.id)}
                      className="w-full flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={opt.logo}
                          className="w-8 h-8 rounded-md object-contain"
                        />
                        <span className="text-white text-sm font-medium">
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-gray-400 text-lg">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {/* Expanded */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        isOpen ? "max-h-56 mt-2" : "max-h-0"
                      }`}
                    >
                      {/* Input + Domain Selector */}
                      <div className="flex items-center gap-2">
                        {/* User input */}
                        <input
                          type="text"
                          placeholder="Enter UPI ID"
                          value={
                            opt.id === "other"
                              ? upiId
                              : upiId.split("@")[0] || ""
                          }
                          onChange={(e) => {
                            const username = e.target.value.replace(/\s+/g, "");
                            const domain =
                              opt.id === "other"
                                ? ""
                                : upiId.includes("@")
                                ? "@" + upiId.split("@")[1]
                                : "@ybl";
                            setUpiId(username + domain);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#2b2e38] border border-gray-700 text-white outline-none"
                        />

                        {/* Domain dropdown except for Other UPI */}
                        {opt.id !== "other" && (
                          <select
                            value={
                              upiId.includes("@")
                                ? "@" + upiId.split("@")[1]
                                : "@ybl"
                            }
                            onChange={(e) => {
                              const username = upiId.split("@")[0] || "";
                              setUpiId(username + e.target.value);
                            }}
                            className="px-3 py-2 rounded-lg bg-[#2b2e38] border border-gray-700 text-white text-sm outline-none"
                          >
                            {UPI_DOMAINS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Pay Button */}
                      <button
                        onClick={handleUpiSubmit}
                        disabled={loadingUpi}
                        className="w-full py-2 bg-[#e02020] hover:bg-[#ff3b3b] rounded-xl text-white font-semibold mt-3 flex items-center justify-center disabled:opacity-60"
                      >
                        {loadingUpi ? <PopupLoader /> : "Pay"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

            <div className="flex gap-3">
              <button
                onClick={() => setShowInstamartAddressPopup(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleInstamartBook}
                disabled={loadingInstamartBook}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingInstamartBook ? <PopupLoader /> : "Book Order"}
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
