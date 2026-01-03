import { useState } from "react";

import type {
  FlipkartProduct as Product,
  FlipkartAddress as Address,
  FlipkartAddressFromAPI as AddressFromAPI,
} from "../../types/flipkart";

import {
  flipkartSearch,
  flipkartAddToCart,
  flipkartVerifyOtp,
  flipkartBuy,
  flipkartSubmitUpi,
} from "../api/flipkartApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
  pushUser: (t: string) => void;
  setIsLoading: (v: boolean) => void;
  setLastSearchQuery: (v: string) => void;
};

function extractSessionId(data: any): string {
  if (!data) return "";
  const sid =
    data.session_id ||
    data.sessionId ||
    data.session ||
    data.sid ||
    data.sessionID ||
    data.data?.session_id ||
    data.data?.sessionId ||
    data.data?.session ||
    data.data?.sid;

  return typeof sid === "string" ? sid : "";
}

async function safeReadError(res: Response) {
  // fetch() doesn't throw on 500; safely parse error body (json or text). [web:94]
  try {
    const data = await res.json();
    return data?.detail || data?.message || JSON.stringify(data);
  } catch {
    try {
      const txt = await res.text();
      return txt || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }
}

export function useFlipkartFlow({
  BaseURL,
  pushSystem,
  pushUser,
  setIsLoading,
  setLastSearchQuery,
}: Opts) {
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
      const { res, data } = await flipkartSearch(BaseURL, { query });
      console.log("STEP 01.2: Search API response:", data);

      if (!res.ok) {
        pushSystem(
          data?.detail || data?.message || "Search failed. Please try again."
        );
        return;
      }

      const sid = extractSessionId(data);
      if (sid) {
        setSessionId(sid);
        console.log("STEP 01.3: Session ID updated to:", sid);
      }

      const products =
        data?.data?.products || data?.products || data?.results || [];
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
    } finally {
      setIsLoading(false);
    }
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
      if (pendingProduct) {
        if (isClothingSearch) {
          // Move forward to size -> safe to close phone now
          setShowPhonePopup(false);
          pushSystem(
            "Mobile number collected. Please select a size for your product."
          );
          setShowSizePopup(true);
        } else {
          // Keep phone popup open while add-to-cart runs
          pushSystem("Mobile number collected. Adding to cart...");
          await handleAddToCart();

          // If add-to-cart opened OTP popup, close phone popup now
          if (showOtpPopup) {
            setShowPhonePopup(false);
          }
        }
      }
    } finally {
      setLoadingPhone(false);
    }
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

      const { res, data } = await flipkartAddToCart(BaseURL, {
        product_url: pendingProduct.product_url,
        product_title: pendingProduct.title,
        phone_number: phone,
        size_label: isClothingSearch ? selectedSize : "",
      });

      console.log("STEP 02.1: Add to cart API response:", data);

      if (!res.ok) {
        pushSystem(
          data?.detail || data?.message || "Failed to add item to cart!"
        );
        return;
      }

      console.log(
        "STEP 02.1 DEBUG: Add-to-cart response keys:",
        Object.keys(data || {})
      );

      const sid = extractSessionId(data);
      if (sid) {
        setSessionId(sid);
        console.log("STEP 02.2: Session ID updated to:", sid);
      }

      if (
        isClothingSearch &&
        Array.isArray(data?.sizes) &&
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
        data?.status === "success" ||
        data?.message?.includes("OTP screen reached")
      ) {
        console.log("STEP 02.4: Add to cart successful, OTP required");
        pushSystem(
          "Item added to cart successfully! OTP verification required."
        );
        setShowPhonePopup(false); // <-- add this
        setShowOtpPopup(true);
      } else if (data?.status === "otp_required" || data?.requires_otp) {
        console.log("STEP 02.5: OTP required");
        pushSystem("OTP verification required to add item to cart.");
        setShowPhonePopup(false); // <-- add this
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

    if (!sessionId) {
      pushSystem(
        "Session not found. Please add to cart again to generate OTP."
      );
      setShowOtpPopup(false);
      return;
    }

    setLoadingOtp(true);

    try {
      console.log("VERIFY OTP: session_id being sent =", sessionId);

      const { res, data } = await flipkartVerifyOtp(BaseURL, {
        session_id: sessionId,
        otp: otp,
      });

      console.log("STEP 04.3: OTP API response:", data);
      console.log("VERIFY OTP full response:", data);

      if (!res.ok) {
        pushSystem(data?.detail || data?.message || "OTP verification failed.");
        return;
      }

      const sid = extractSessionId(data);
      if (sid) {
        setSessionId(sid);
        console.log("STEP 04.5: Session ID updated after OTP verify:", sid);
      }

      if (data?.status === "success") {
        console.log("STEP 04.4: OTP verification successful");
        setShowOtpPopup(false);

        if (Array.isArray(data?.addresses) && data.addresses.length > 0) {
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
    } finally {
      setLoadingOtp(false);
    }
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

    if (!sessionId) {
      pushSystem("Session not found. Please restart checkout.");
      return;
    }

    setLoadingBuy(true);
    console.log("BUY: sending session_id =", sessionId);
    console.log("BUY: selectedAddressId =", selectedAddressId);

    try {
      const { res, data } = await flipkartBuy(BaseURL, {
        session_id: sessionId,
        address_id: "",
        name: address.name,
        phone: address.phone,
        pincode: address.pincode,
        locality: address.locality,
        address_line1: address.address_line1,
      });

      if (!res.ok) {
        const errMsg = await safeReadError(res);
        console.log("Buy API HTTP error:", res.status, errMsg);

        setShowAddressPopup(false);
        pushSystem("Error from Flipkart server. Please try again.");
        return;
      }

      console.log("Buy API response with new address:", data);

      if (data?.status === "success" || data?.message?.includes("success")) {
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
        setShowAddressPopup(false);
        pushSystem("Error from Flipkart server. Please try again.");
      }
    } catch (err) {
      console.log("Error:", err);
      setShowAddressPopup(false);
      pushSystem("Error from Flipkart server. Please try again.");
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

    if (!sessionId) {
      pushSystem("Session not found. Please restart checkout.");
      return;
    }

    setLoadingBuy(true);

    try {
      const { res, data } = await flipkartBuy(BaseURL, {
        session_id: sessionId,
        address_id: selectedAddressId === "current" ? "" : selectedAddressId,
      });

      if (!res.ok) {
        const errMsg = await safeReadError(res);
        console.log("STEP 05.1: Buy API HTTP error:", res.status, errMsg);

        setShowAddressPopup(false);
        setShowPhonePopup(false);
        pushSystem("Error from Flipkart server. Please try again.");
        return;
      }

      console.log("STEP 05.1: Buy API response:", data);

      if (data?.status === "success" || data?.message?.includes("success")) {
        console.log("STEP 05.2: Order placed successfully");
        setShowAddressPopup(false);
        setShowUpiPopup(true);
        pushSystem("Order placed successfully! Please complete the payment.");
      } else {
        console.log("STEP 05.3: Order failed");
        setShowAddressPopup(false);
        pushSystem("Error from Flipkart server. Please try again.");
      }
    } catch (err) {
      console.log("STEP 05: Error:", err);
      setShowAddressPopup(false);
      pushSystem("Error from Flipkart server. Please try again.");
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

    if (!sessionId) {
      pushSystem("Session not found. Please restart checkout.");
      return;
    }

    setLoadingPayment(true);

    try {
      const { res, data } = await flipkartSubmitUpi(BaseURL, {
        session_id: sessionId,
        upi_id: upiId,
      });

      if (!res.ok) {
        pushSystem(data?.detail || data?.message || "Payment failed!");
        return;
      }

      console.log("STEP 06.1: UPI API response:", data);

      if (data?.status === "success" || data?.message?.includes("success")) {
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

  return {
    // state
    showPhonePopup,
    showOtpPopup,
    showSizePopup,
    showAddressPopup,
    showUpiPopup,

    phone,
    otp,
    selectedSize,
    upiId,
    address,

    addresses,
    selectedAddressId,

    loadingPhone,
    loadingOtp,
    loadingCart,
    loadingPayment,
    loadingBuy,

    sessionId,
    pendingProduct,
    availableSizes,
    isClothingSearch,

    // setters
    setShowPhonePopup,
    setShowOtpPopup,
    setShowSizePopup,
    setShowAddressPopup,
    setShowUpiPopup,

    setPhone,
    setOtp,
    setSelectedSize,
    setUpiId,
    setAddress,

    setAddresses,
    setSelectedAddressId,

    // actions
    handleSearch,
    handleProductSelect,
    handlePhoneSubmit,
    handleSizeSelect,
    handleAddToCart,
    handleOtpSubmit,
    handleBuyWithNewAddress,
    handleBuy,
    handleUpiSubmit,
  };
}
