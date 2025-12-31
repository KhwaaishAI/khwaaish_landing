import { useEffect, useMemo, useState } from "react";

import type { AmazonProduct, FlipkartProduct } from "../types/unified";
import type { Address, AddressFromAPI } from "../types/flipkart";

import { searchAmazon, searchFlipkart } from "../utils/api";

import UnifiedLandingView from "../components/unified/UnifiedLandingView";
import UnifiedChatView from "../components/unified/UnifiedChatView";

// Reuse existing popups from flipkart flow
import PhonePopup from "../components/flipkart/PhonePupup";
import SizePopup from "../components/flipkart/SizePopup";
import OtpPopup from "../components/flipkart/OtpPopup";
import AddressPopup from "../components/flipkart/AddressPopup";
import Upipopup from "../components/flipkart/UpiPopup";

type UnifiedMessage = {
  id: string;
  role: "user" | "system";
  content: string;
};

type SelectedMarket = "flipkart" | "amazon" | null;

// NOTE: matches your current UnifiedLanding.tsx [file:2]
const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

const mkId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

export default function UnifiedLanding() {
  const [query, setQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  // Search results + session ids
  const [flipkartProducts, setFlipkartProducts] = useState<FlipkartProduct[]>(
    []
  );
  const [amazonProducts, setAmazonProducts] = useState<AmazonProduct[]>([]);
  const [flipkartSessionId, setFlipkartSessionId] = useState("");
  const [amazonSessionId, setAmazonSessionId] = useState("");

  // Which checkout is active right now
  const [selectedMarket, setSelectedMarket] = useState<SelectedMarket>(null);
  const [pendingFlipkartProduct, setPendingFlipkartProduct] =
    useState<FlipkartProduct | null>(null);
  const [pendingAmazonProduct, setPendingAmazonProduct] =
    useState<AmazonProduct | null>(null);

  // Popups
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [forceNewAddress, setForceNewAddress] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  // Data collected in flow (shared UI inputs)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [upiId, setUpiId] = useState("");

  // Flipkart address form (reused for Amazon by mapping)
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address_line1: "",
  });

  // Flipkart saved addresses
  const [addresses, setAddresses] = useState<AddressFromAPI[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Loading flags
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Flipkart session_id for checkout APIs
  const [fkCheckoutSessionId, setFkCheckoutSessionId] = useState("");

  // Shared sizing for clothing
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [isClothingSearch, setIsClothingSearch] = useState(false);

  // Amazon product details + available sizes (optional)
  const [amzProductDetails, setAmzProductDetails] = useState<any>(null);
  const [loadingDetailsAmazon, setLoadingDetailsAmazon] = useState(false);

  const pushSystem = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: mkId(), role: "system", content: text },
    ]);

  const pushUser = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: mkId(), role: "user", content: text },
    ]);

  const withTimeout = async <T,>(p: Promise<T>, ms = 20000): Promise<T> => {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timed out after ${ms}ms`)),
          ms
        )
      ),
    ]);
  };

  const detectClothing = (q: string) => {
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
    const ql = q.toLowerCase();
    return clothingKeywords.some((k) => ql.includes(k));
  };

  const onSearch = async (qOverride?: string) => {
    const q = (qOverride ?? query).trim();
    if (!q) return;

    setShowChat(true);
    pushUser(q);

    setIsLoading(true);
    setLastSearchQuery(q);
    setFlipkartProducts([]);
    setAmazonProducts([]);

    const clothing = detectClothing(q);
    setIsClothingSearch(clothing);

    try {
      const [fkRes, amzRes] = await Promise.allSettled([
        withTimeout(searchFlipkart(q), 20000),
        withTimeout(searchAmazon(q), 20000),
      ]);

      const fkProducts: FlipkartProduct[] =
        fkRes.status === "fulfilled" ? fkRes.value.products || [] : [];
      const amzProducts: AmazonProduct[] =
        amzRes.status === "fulfilled" ? amzRes.value.products || [] : [];

      if (fkRes.status === "fulfilled") {
        setFlipkartProducts(fkProducts);
        setFlipkartSessionId(fkRes.value.sessionId || "");
      } else {
        setFlipkartProducts([]);
      }

      if (amzRes.status === "fulfilled") {
        setAmazonProducts(amzProducts);
        setAmazonSessionId(amzRes.value.sessionId || "");
      } else {
        setAmazonProducts([]);
      }

      pushSystem(
        JSON.stringify({
          type: "unified_product_list",
          flipkartProducts: fkProducts,
          amazonProducts: amzProducts,
          lastSearchQuery: q,
          isClothing: clothing,
        })
      );

      if (fkProducts.length === 0 && amzProducts.length === 0) {
        pushSystem("No products found. Try a different query.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSend = async () => {
    const text = messageInput.trim();
    if (!text) return;
    setMessageInput("");
    await onSearch(text);
  };

  const resetCheckoutUiBits = () => {
    setShowPhonePopup(false);
    setShowSizePopup(false);
    setShowOtpPopup(false);
    setShowAddressPopup(false);
    setShowUpiPopup(false);
    setLoadingDetailsAmazon(false);

    setPhone("");
    setOtp("");
    setSelectedSize("");
    setUpiId("");

    setAvailableSizes([]);
    setAddresses([]);
    setSelectedAddressId("");

    setAddress({
      name: "",
      phone: "",
      pincode: "",
      locality: "",
      address_line1: "",
    });

    setAmzProductDetails(null);
  };

  const onFlipkartSelect = (p: FlipkartProduct) => {
    resetCheckoutUiBits();

    setSelectedMarket("flipkart");
    setPendingFlipkartProduct(p);
    setPendingAmazonProduct(null);

    pushSystem(
      "Selected Flipkart product. Please enter your mobile number to continue."
    );
    setShowPhonePopup(true);
  };

  // ===== AMAZON: product details -> phone -> size(optional) -> add-to-cart -> otp -> address -> upi =====
  const buildAmazonUrl = (path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${BaseURL}${normalized}`;
  };

  const ensureAmazonSession = () => {
    if (!amazonSessionId) {
      pushSystem("Amazon session expired. Please search again.");
      return false;
    }
    return true;
  };

  const handleAmazonProductSelect = async (p: AmazonProduct) => {
    resetCheckoutUiBits();

    setSelectedMarket("amazon");
    setPendingAmazonProduct(p);
    setPendingFlipkartProduct(null);

    if (!ensureAmazonSession()) return;

    const productUrl =
      (p as any).product_url ||
      (p as any).producturl ||
      (p as any).url ||
      (p as any).link;

    if (!productUrl) {
      pushSystem(
        "Amazon product URL is missing. Please select another product."
      );
      return;
    }

    setLoadingDetailsAmazon(true);
    try {
      const response = await fetch(
        buildAmazonUrl("/amazon/get-product-details"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: amazonSessionId,
            product_url: productUrl,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Amazon get-product-details failed: ${response.status}. ${text}`
        );
      }

      const data = await response.json();

      if (data?.status === "success" && data?.details) {
        setAmzProductDetails(data.details);

        const sizes = Array.isArray(data.details.availablesizes)
          ? data.details.availablesizes
          : [];

        setAvailableSizes(sizes);

        pushSystem(
          "Selected Amazon product. Please enter your mobile number to continue."
        );
        setShowPhonePopup(true);
      } else {
        pushSystem(
          "Failed to load Amazon product details. Please try another product."
        );
      }
    } catch (err) {
      console.error(err);
      pushSystem("Failed to load Amazon product details. Please try again.");
    } finally {
      setLoadingDetailsAmazon(false);
    }
  };

  const onAmazonSelect = (p: AmazonProduct) => {
    void handleAmazonProductSelect(p);
  };

  const handleAmazonLogin = async () => {
    if (!ensureAmazonSession()) return;

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingPhone(true);
    try {
      const res = await fetch(buildAmazonUrl("/amazon/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: amazonSessionId,
          phone,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Amazon login failed: ${res.status}. ${text}`);
      }

      const data = await res.json();
      console.log("Login failed", data);

      setShowPhonePopup(false);

      if (data?.status === "success") {
        if (isClothingSearch && availableSizes.length > 0) {
          pushSystem(
            "Mobile number verified. Please select a size for your product."
          );
          setShowSizePopup(true);
        } else {
          pushSystem("Mobile number verified. Adding to cart...");
          await handleAmazonAddToCart();
        }
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleAmazonAddToCart = async () => {
    if (loadingCart) return;
    if (!ensureAmazonSession()) return;

    // If clothing, ensure size
    if (isClothingSearch && availableSizes.length > 0 && !selectedSize) {
      pushSystem("Please select a size from the available options.");
      setShowSizePopup(true);
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch(buildAmazonUrl("/amazon/add-to-cart"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: amazonSessionId,
          size: isClothingSearch ? selectedSize : "",
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Amazon add-to-cart failed: ${res.status}. ${text}`);
      }

      const data = await res.json();

      if (data?.status === "success") {
        pushSystem(
          data?.message || "Item added to cart successfully! Please verify OTP."
        );
        setShowOtpPopup(true);
      } else {
        pushSystem("Failed to add item to cart. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Failed to add item to cart!");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleAmazonOtpVerify = async () => {
    if (!ensureAmazonSession()) return;

    if (!otp.trim() || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoadingOtp(true);
    try {
      const res = await fetch(buildAmazonUrl("/amazon/submit-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: amazonSessionId,
          otp,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Amazon submit-otp failed: ${res.status}. ${text}`);
      }

      const data = await res.json();

      if (data?.status === "success") {
        setShowOtpPopup(false);
        pushSystem(
          "OTP verified successfully! Please provide shipping address."
        );
        // For Amazon we will use the Flipkart AddressPopup but map fields when submitting
        setSelectedAddressId("current");
        setAddresses([]);
        setShowAddressPopup(true);
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoadingOtp(false);
    }
  };

  const mapFlipkartAddressToAmazonPayload = () => {
    // Amazon expects: fullname, mobilenumber, pincode, houseno, area, landmark
    // Flipkart popup provides: name, phone, pincode, locality, address_line1
    const fullname = address.name || "";
    const mobilenumber = address.phone || phone || "";
    const pincode = address.pincode || "";
    const houseno = address.address_line1 || "";
    const area = address.locality || "";
    const landmark = "";

    return { fullname, mobilenumber, pincode, houseno, area, landmark };
  };

  const handleAmazonAddressSave = async () => {
    if (!ensureAmazonSession()) return;
    if (loadingBuy) return;

    const payload = mapFlipkartAddressToAmazonPayload();
    if (
      !payload.fullname ||
      !payload.mobilenumber ||
      !payload.pincode ||
      !payload.houseno ||
      !payload.area
    ) {
      alert("Please fill all required address fields");
      return;
    }

    setLoadingBuy(true);
    try {
      const res = await fetch(buildAmazonUrl("/amazon/add-address"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: amazonSessionId,
          full_name: payload.fullname,
          mobile_number: payload.mobilenumber,
          pincode: payload.pincode,
          house_no: payload.houseno,
          area: payload.area,
          landmark: payload.landmark,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Amazon add-address failed: ${res.status}. ${text}`);
      }

      const data = await res.json();

      if (data?.status === "success") {
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Address saved successfully! Please complete the payment.");
      } else {
        pushSystem("Failed to save address. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Failed to save address!");
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleAmazonPayUpi = async () => {
    if (!ensureAmazonSession()) return;
    if (loadingPayment) return;

    if (!upiId.trim()) {
      alert("Please enter your UPI ID");
      return;
    }

    setLoadingPayment(true);
    try {
      const res = await fetch(buildAmazonUrl("/amazon/pay-with-upi"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: amazonSessionId,
          upi_id: upiId,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Amazon pay-with-upi failed: ${res.status}. ${text}`);
      }

      const data = await res.json();

      if (data?.status === "success") {
        setShowUpiPopup(false);
        pushSystem(
          JSON.stringify({
            type: "order_success",
            message:
              "Payment successful! Your Amazon order has been confirmed.",
          })
        );
      } else {
        pushSystem("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Payment failed!");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleAddToCart_Flipkart = async () => {
    if (loadingCart) return;
    if (selectedMarket !== "flipkart") return;

    if (!pendingFlipkartProduct) {
      pushSystem("Please select a Flipkart product first.");
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

    const productUrl =
      (pendingFlipkartProduct as any).product_url ||
      (pendingFlipkartProduct as any).producturl;
    const title =
      (pendingFlipkartProduct as any).title ||
      (pendingFlipkartProduct as any).product_title;

    if (!productUrl) {
      pushSystem("Product URL is missing. Please select another product.");
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch(`${BaseURL}/api/flipkart/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_url: productUrl,
          product_title: title,
          phone_number: phone,
          size_label: isClothingSearch ? selectedSize : "",
        }),
      });

      const data = await res.json();

      // keep session updated
      const sid = data.session_id || data.sessionid;
      if (sid) setFkCheckoutSessionId(sid);

      if (!res.ok) {
        console.error("add-to-cart failed:", data);
        pushSystem("Failed to add to cart. Please try again.");
        return;
      }

      // Always open OTP popup when backend indicates OTP
      const needsOtp =
        data.status === "otp_required" ||
        data.requires_otp === true ||
        (typeof data.message === "string" &&
          data.message.toLowerCase().includes("otp")) ||
        data.message?.includes?.("OTP");

      if (needsOtp) {
        pushSystem("OTP verification required. Please enter the OTP.");
        setShowOtpPopup(true);
        return;
      }

      // If backend says success without OTP
      if (data.status === "success") {
        pushSystem(data.message || "Added to cart successfully.");
        // optionally proceed to address/payment here if backend supports it
        return;
      }

      pushSystem("Unexpected response. Please try again.");
      console.log("Unknown add-to-cart response:", data);
    } catch (err) {
      console.error(err);
      pushSystem("Failed to add item to cart!");
    } finally {
      setLoadingCart(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (selectedMarket === "amazon") {
      await handleAmazonLogin();
      return;
    }

    // Flipkart
    if (selectedMarket !== "flipkart") {
      setShowPhonePopup(false);
      return;
    }

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoadingPhone(true);
    try {
      setShowPhonePopup(false);

      if (isClothingSearch) {
        pushSystem(
          "Mobile number collected. Please select a size for your product."
        );
        setShowSizePopup(true);
      } else {
        pushSystem("Mobile number collected. Adding to cart...");
        await handleAddToCart_Flipkart();
      }
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleSizeSelect = async () => {
    if (selectedMarket === "amazon") {
      if (isClothingSearch && availableSizes.length > 0 && !selectedSize) {
        alert("Please select a size");
        return;
      }
      setShowSizePopup(false);
      pushSystem(
        isClothingSearch
          ? `Size ${selectedSize} selected. Adding to cart...`
          : "Adding to cart..."
      );
      await handleAmazonAddToCart();
      return;
    }

    // Flipkart
    if (selectedMarket !== "flipkart") {
      setShowSizePopup(false);
      return;
    }

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
    await handleAddToCart_Flipkart();
  };

  const handleOtpSubmit = async () => {
    if (selectedMarket === "amazon") {
      await handleAmazonOtpVerify();
      return;
    }

    if (selectedMarket !== "flipkart") return;

    if (!otp.trim() || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    if (!fkCheckoutSessionId) {
      alert("Session missing. Please try add-to-cart again.");
      return;
    }

    setLoadingOtp(true);
    try {
      const res = await fetch(`${BaseURL}/api/flipkart/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: fkCheckoutSessionId,
          otp,
        }),
      });

      const data = await res.json();

      const sid = data.session_id || data.sessionid;
      if (sid) setFkCheckoutSessionId(sid);

      if (!res.ok || data.status !== "success") {
        console.error("verify-otp failed:", data);
        pushSystem("Invalid OTP. Please try again.");
        return;
      }

      setShowOtpPopup(false);

      // accept both keys from backend
      const raw = data.addresses ?? data.saved_addresses ?? [];
      const list: AddressFromAPI[] = Array.isArray(raw) ? raw : [];

      setAddresses(list);

      if (list.length > 0) {
        const def = list.find((a: any) => a.is_default || a.isdefault);
        const firstId =
          (def as any)?.address_id ||
          (def as any)?.addressid ||
          (list[0] as any).address_id ||
          (list[0] as any).addressid ||
          "";

        setSelectedAddressId(firstId);
        setForceNewAddress(false);
        setShowAddressPopup(true);
        pushSystem(
          "OTP verified successfully! Please select a shipping address."
        );
      } else {
        setSelectedAddressId("");
        setForceNewAddress(true);
        setShowAddressPopup(true);
        pushSystem(
          "OTP verified successfully! No addresses found in your account. Please add a new address."
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleBuy = async () => {
    // Amazon uses AddressPopup as a "new address form"
    if (selectedMarket === "amazon") {
      await handleAmazonAddressSave();
      return;
    }

    // Flipkart
    if (selectedMarket !== "flipkart") return;
    if (loadingBuy) return;

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
          session_id: fkCheckoutSessionId,
          address_id: selectedAddressId === "current" ? "" : selectedAddressId,
        }),
      });

      const data = await res.json();

      if (data.status === "success" || data.message?.includes("success")) {
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Order placed successfully! Please complete the payment.");
      } else {
        pushSystem("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Failed to place order!");
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleBuyWithNewAddress = async () => {
    // Amazon: treat as same primary action (save address)
    if (selectedMarket === "amazon") {
      await handleAmazonAddressSave();
      return;
    }

    // Flipkart
    if (selectedMarket !== "flipkart") return;
    if (loadingBuy) return;

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
          session_id: fkCheckoutSessionId,
          address_id: "",
          name: address.name,
          phone: address.phone,
          pincode: address.pincode,
          locality: address.locality,
          address_line1: address.address_line1,
        }),
      });

      const data = await res.json();

      if (data.status === "success" || data.message?.includes("success")) {
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
        pushSystem("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Failed to place order!");
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (selectedMarket === "amazon") {
      await handleAmazonPayUpi();
      return;
    }

    // Flipkart
    if (selectedMarket !== "flipkart") return;
    if (loadingPayment) return;

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
          session_id: fkCheckoutSessionId,
          upi_id: upiId,
        }),
      });

      const data = await res.json();

      if (data.status === "success" || data.message?.includes("success")) {
        setShowUpiPopup(false);
        pushSystem(
          JSON.stringify({
            type: "order_success",
            message: "Payment successful! Your order has been confirmed.",
          })
        );
      } else {
        pushSystem("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      pushSystem("Payment failed!");
    } finally {
      setLoadingPayment(false);
    }
  };

  const pendingProductForPopup = useMemo(() => {
    if (selectedMarket === "amazon") return pendingAmazonProduct as any;
    return pendingFlipkartProduct as any;
  }, [selectedMarket, pendingAmazonProduct, pendingFlipkartProduct]);

  // Keep as-is; optional
  useEffect(() => {}, []);

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* ===== POPUPS ===== */}
      <PhonePopup
        open={showPhonePopup}
        phone={phone}
        setPhone={setPhone}
        onContinue={handlePhoneSubmit}
        loading={loadingPhone}
      />

      <SizePopup
        open={showSizePopup}
        pendingProduct={pendingProductForPopup}
        availableSizes={availableSizes}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        isClothingSearch={isClothingSearch}
        loadingCart={loadingCart}
        onConfirm={handleSizeSelect}
        onSkipNonClothing={async () => {
          setShowSizePopup(false);
          if (selectedMarket === "amazon") {
            await handleAmazonAddToCart();
          } else {
            await handleAddToCart_Flipkart();
          }
        }}
      />

      <OtpPopup
        open={showOtpPopup}
        phone={phone}
        otp={otp}
        setOtp={setOtp}
        onVerify={handleOtpSubmit}
        loading={loadingOtp}
      />

      <AddressPopup
        open={showAddressPopup}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        address={address}
        setAddress={setAddress}
        loadingBuy={loadingBuy}
        onCancel={() => {
          setShowAddressPopup(false);
          pushSystem("Address selection cancelled.");
        }}
        onUseThisAddress={handleBuy}
        onSaveAndPlaceOrder={handleBuyWithNewAddress}
        forceNewAddress={forceNewAddress}
      />

      <Upipopup
        open={showUpiPopup}
        pendingProduct={pendingProductForPopup}
        upiId={upiId}
        setUpiId={setUpiId}
        onPay={handleUpiSubmit}
        loading={loadingPayment}
      />

      {/* ===== MAIN UI ===== */}
      {showChat ? (
        <UnifiedChatView
          messages={messages}
          isLoading={isLoading || loadingDetailsAmazon}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={onSend}
          onFlipkartSelect={onFlipkartSelect}
          onAmazonSelect={onAmazonSelect}
        />
      ) : (
        <UnifiedLandingView
          query={query}
          setQuery={setQuery}
          onSearch={() => onSearch()}
          isLoading={isLoading || loadingDetailsAmazon}
          lastSearchQuery={lastSearchQuery}
          flipkartProducts={flipkartProducts}
          amazonProducts={amazonProducts}
          onFlipkartSelect={onFlipkartSelect}
          onAmazonSelect={onAmazonSelect}
        />
      )}
    </div>
  );
}
