import { useMemo, useState } from "react";

import type {
  AmazonSearchResultItem,
  AmazonProductDetails,
  AmazonShippingAddress,
} from "../../types/amazon";

import {
  amazonSearch,
  amazonGetProductDetails,
  amazonAddToCart,
  amazonLogin,
  amazonSubmitOtp,
  amazonAddAddress,
  amazonPayWithUpi,
} from "../api/amazonApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
  pushUser: (t: string) => void;
  setIsLoading: (v: boolean) => void;
  setLastSearchQuery: (v: string) => void;
};

async function safeReadError(res: Response) {
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

export default function useAmazonFlow({
  BaseURL,
  pushSystem,
  pushUser,
  setIsLoading,
  setLastSearchQuery,
}: Opts) {
  // Popups
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showSelectAddressPopup, setShowSelectAddressPopup] = useState(false);
  const [showUpiPopup, setShowUpiPopup] = useState(false);

  // Loading flags
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Data
  const [sessionId, setSessionId] = useState("");
  const [results, setResults] = useState<AmazonSearchResultItem[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<AmazonSearchResultItem | null>(null);
  const [details, setDetails] = useState<AmazonProductDetails | null>(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [upiId, setUpiId] = useState("");

  const [shippingAddresses, setShippingAddresses] = useState<
    AmazonShippingAddress[]
  >([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | null
  >(null);

  // Enter address form (body exactly as you requested)
  const [address, setAddress] = useState({
    full_name: "",
    mobile_number: "",
    pincode: "",
    house_no: "",
    area: "",
    landmark: "",
  });

  const canShowSizes = useMemo(
    () =>
      Array.isArray(details?.available_sizes) &&
      details!.available_sizes.length > 0,
    [details]
  );

  const resetCheckoutPopups = () => {
    setShowProductDetails(false);
    setShowSizePopup(false);
    setShowPhonePopup(false);
    setShowOtpPopup(false);
    setShowAddressPopup(false);
    setShowSelectAddressPopup(false);
    setShowUpiPopup(false);
  };

  const handleSearch = async (query: string) => {
    console.log("AMAZON STEP 01: Search triggered:", query);
    setLastSearchQuery(query);

    if (!query.trim()) {
      pushSystem("Please enter a product to search!");
      return;
    }

    setIsLoading(true);
    pushUser(query);

    try {
      const { res, data } = await amazonSearch(BaseURL, { query });
      console.log("AMAZON STEP 01.2: Search response:", data);

      if (!res.ok) {
        pushSystem(
          data?.detail || data?.message || "Search failed. Please try again."
        );
        return;
      }

      if (data?.session_id) {
        setSessionId(data.session_id);
        console.log("AMAZON STEP 01.3: sessionId set:", data.session_id);
      }

      const list = (data?.results || []) as AmazonSearchResultItem[];
      setResults(list);

      pushSystem(
        JSON.stringify({
          type: "amazon_productlist",
          products: list,
        })
      );
    } catch (err) {
      console.log("AMAZON STEP 01 Error:", err);
      pushSystem("Something went wrong while searching!");
    } finally {
      setIsLoading(false);
    }
  };

  const setSessionFromOutside = (sid: string) => {
    if (sid) setSessionId(sid);
  };

  // Product details (details-only)
  const handleOpenDetails = async (product: AmazonSearchResultItem) => {
    console.log("AMAZON STEP D1: Product details button clicked:", product);
    setSelectedProduct(product);

    if (!sessionId) {
      pushSystem("Session not found. Please search again.");
      return;
    }

    setShowProductDetails(true);
    setLoadingDetails(true);
    setDetails(null);

    try {
      const { res, data } = await amazonGetProductDetails(BaseURL, {
        session_id: sessionId,
        product_url: product.product_url,
      });

      console.log("AMAZON STEP D2: get-product-details response:", data);

      if (!res.ok || data?.status !== "success" || !data?.details) {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail || "Failed to load product details.";
        pushSystem(errMsg);
        setShowProductDetails(false);
        return;
      }

      setDetails(data.details);
    } catch (err) {
      console.log("AMAZON STEP D-ERROR:", err);
      pushSystem("Something went wrong while loading product details.");
      setShowProductDetails(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Existing flow continues from size -> add-to-cart
  const handleSizeContinue = async () => {
    console.log("AMAZON STEP 03: Size continue. selectedSize:", selectedSize);

    if (!sessionId) {
      pushSystem("Session not found. Please search again.");
      return;
    }

    if (!selectedSize.trim()) {
      pushSystem("Please select a size.");
      return;
    }

    // IMPORTANT: keep size popup open while loading (until phone popup opens)
    setLoadingCart(true);

    try {
      const { res, data } = await amazonAddToCart(BaseURL, {
        session_id: sessionId,
        size: selectedSize,
      });

      console.log("AMAZON STEP 03.2: Add-to-cart response:", data);

      if (!res.ok || data?.status !== "success") {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail;
        pushSystem(errMsg || "Failed to add item to cart.");
        setShowProductDetails(false);
        return;
      }

      // Now open phone popup and only then close size popup
      pushSystem("Added to cart. Please enter your phone number to login.");
      setShowPhonePopup(true);
      setShowSizePopup(false);
    } catch (err) {
      console.log("AMAZON STEP 03 Error:", err);
      pushSystem("Failed to add to cart.");
      setShowProductDetails(false);
    } finally {
      setLoadingCart(false);
    }
  };

  const handlePhoneContinue = async () => {
    console.log("AMAZON STEP 04: Phone continue. phone:", phone);

    if (!sessionId) {
      pushSystem("Session not found. Please search again.");
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, "").length !== 10) {
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }

    // IMPORTANT: keep phone popup open while loading (until otp popup opens)
    setLoadingLogin(true);

    try {
      const { res, data } = await amazonLogin(BaseURL, {
        session_id: sessionId,
        phone,
      });

      console.log("AMAZON STEP 04.2: Login response:", data);

      if (!res.ok || data?.status !== "success") {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail;
        pushSystem(errMsg || "Login failed.");
        return;
      }

      pushSystem("OTP requested. Please enter OTP.");
      setShowOtpPopup(true);
      setShowPhonePopup(false);
    } catch (err) {
      console.log("AMAZON STEP 04 Error:", err);
      pushSystem("Login failed.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const callPayWithUpi = async (addressIndex?: number | null) => {
    console.log(
      "AMAZON STEP PAY: pay-with-upi. upiId:",
      upiId,
      "addressIndex:",
      addressIndex
    );

    if (!sessionId) {
      pushSystem("Session not found. Please restart.");
      return;
    }

    if (!upiId.trim()) {
      pushSystem("Please enter your UPI ID.");
      return;
    }

    setLoadingPayment(true);

    try {
      const payload: any = {
        session_id: sessionId,
        upi_id: upiId,
      };

      if (typeof addressIndex === "number") {
        payload.address_index = addressIndex;
      }

      const { res, data } = await amazonPayWithUpi(BaseURL, payload);

      console.log("AMAZON STEP PAY.2: pay-with-upi response:", data);

      if (!res.ok || data?.status !== "success") {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail;
        pushSystem(errMsg || "Payment failed.");
        return;
      }

      setShowUpiPopup(false);
      setShowSelectAddressPopup(false);
      setShowProductDetails(false);

      pushSystem(
        JSON.stringify({
          type: "ordersuccess",
          message: data?.message || "Payment initiated successfully.",
        })
      );

      setOtp("");
      setSelectedSize("");
    } catch (err) {
      console.log("AMAZON STEP PAY Error:", err);
      pushSystem("Payment failed.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleOtpVerify = async () => {
    console.log("AMAZON STEP 05: OTP verify. otp:", otp);

    if (!sessionId) {
      pushSystem("Session not found. Please restart.");
      return;
    }

    if (!otp.trim() || otp.replace(/\D/g, "").length !== 6) {
      pushSystem("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoadingOtp(true);

    try {
      const { res, data } = await amazonSubmitOtp(BaseURL, {
        session_id: sessionId,
        otp,
      });

      console.log("AMAZON STEP 05.2: Submit-otp response:", data);

      if (!res.ok || data?.status !== "success") {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail;
        pushSystem(errMsg || "OTP verification failed.");
        setShowOtpPopup(false);
        return;
      }

      setShowOtpPopup(false);

      // KEY CHANGE:
      // If "shipping_address" key exists and has addresses -> open SelectAddress popup
      // If "shipping_address" key is absent -> open EnterAddress popup
      if ("shipping_address" in (data || {})) {
        const addresses = Array.isArray(data?.shipping_address)
          ? (data.shipping_address as AmazonShippingAddress[])
          : [];

        if (addresses.length > 0) {
          setShippingAddresses(addresses);

          // pick first index just to store, user still selects one
          const firstIdx =
            typeof (addresses[0] as any)?.index === "number"
              ? (addresses[0] as any).index
              : typeof (addresses[0] as any)?.address_index === "number"
              ? (addresses[0] as any).address_index
              : 0;

          setSelectedAddressIndex(firstIdx);

          pushSystem("Select a shipping address to pay.");
          setShowSelectAddressPopup(true);
          return;
        }

        // shipping_address key exists but empty -> ask user to add address
        pushSystem("No saved address found. Please add a shipping address.");
        setShowAddressPopup(true);
        return;
      }

      // shipping_address key absent
      pushSystem("Please add a shipping address.");
      setShowAddressPopup(true);
    } catch (err) {
      console.log("AMAZON STEP 05 Error:", err);
      pushSystem("OTP verification failed.");
      setShowOtpPopup(false);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSaveAddress = async () => {
    console.log("AMAZON STEP 06: Save address:", address);

    if (!sessionId) {
      pushSystem("Session not found. Please restart.");
      return;
    }

    const required =
      address.full_name.trim() &&
      address.mobile_number.trim() &&
      address.pincode.trim() &&
      address.house_no.trim() &&
      address.area.trim();

    if (!required) {
      pushSystem("Please fill all required address fields.");
      return;
    }

    setLoadingAddress(true);

    try {
      const { res, data } = await amazonAddAddress(BaseURL, {
        session_id: sessionId,
        full_name: address.full_name,
        mobile_number: address.mobile_number,
        pincode: address.pincode,
        house_no: address.house_no,
        area: address.area,
        landmark: address.landmark,
      });

      console.log("AMAZON STEP 06.2: Add-address response:", data);

      if (!res.ok || data?.status !== "success") {
        const errMsg = !res.ok
          ? await safeReadError(res)
          : data?.message || data?.detail;
        pushSystem(errMsg || "Failed to add address.");
        return;
      }

      const idx =
        typeof data?.address_index === "number"
          ? data.address_index
          : typeof data?.addressIndex === "number"
          ? data.addressIndex
          : null;

      setSelectedAddressIndex(idx);

      setShowAddressPopup(false);

      pushSystem("Address saved. Proceeding to UPI payment.");
      setShowUpiPopup(true);
    } catch (err) {
      console.log("AMAZON STEP 06 Error:", err);
      pushSystem("Failed to add address.");
    } finally {
      setLoadingAddress(false);
    }
  };

  // UPI popup "Pay" button (same as before, but uses helper)
  const handlePayWithUpi = async () => {
    console.log("AMAZON STEP 07: Pay with UPI. upiId:", upiId);

    if (!sessionId) {
      pushSystem("Session not found. Please restart.");
      return;
    }

    if (!upiId.trim()) {
      pushSystem("Please enter your UPI ID.");
      return;
    }

    setLoadingPayment(true);

    try {
      const payload: any = {
        session_id: sessionId,
        upi_id: upiId,
      };

      if (typeof selectedAddressIndex === "number") {
        payload.address_index = selectedAddressIndex;
      }

      console.log("AMAZON STEP 07.1: pay-with-upi payload:", payload);

      const { res, data } = await amazonPayWithUpi(BaseURL, payload);

      console.log("AMAZON STEP 07.2: pay-with-upi response:", data);

      if (!res.ok || data?.status !== "success") {
        const serverMsg = !res.ok
          ? await safeReadError(res)
          : data?.detail || data?.message || "Payment failed.";

        pushSystem(
          `Error from Amazon servers: ${serverMsg}. Unable to complete the payment.`
        );

        // close all popups on payment error
        resetCheckoutPopups();
        return;
      }

      // success
      resetCheckoutPopups();

      pushSystem(
        JSON.stringify({
          type: "ordersuccess",
          message: data?.message || "Payment initiated successfully.",
        })
      );

      // cleanup (optional)
      setOtp("");
      setSelectedSize("");
    } catch (err) {
      console.log("AMAZON STEP 07 Error:", err);

      pushSystem(
        "Error from Amazon servers: Payment request failed. Unable to complete the payment."
      );

      // close all popups on unexpected error too
      resetCheckoutPopups();
    } finally {
      setLoadingPayment(false);
    }
  };

  // Select address popup click -> directly pay with that address index
  const handleSelectAddressAndPay = async (addressIndex: number) => {
    setSelectedAddressIndex(addressIndex);
    await callPayWithUpi(addressIndex);
  };

  // Cancels/back
  const cancelFromSize = () => {
    console.log("AMAZON UI: Cancel from Size -> back to product details");
    setShowSizePopup(false);
    setShowProductDetails(true);
  };

  const cancelFromPhone = () => {
    console.log("AMAZON UI: Cancel from Phone -> back to size popup");
    setShowPhonePopup(false);
    setShowSizePopup(true);
  };

  const cancelFromOtp = () => {
    console.log("AMAZON UI: Cancel from OTP -> back to phone popup");
    setShowOtpPopup(false);
    setShowPhonePopup(true);
  };

  const cancelFromAddress = () => {
    console.log("AMAZON UI: Cancel from Address -> back to OTP popup");
    setShowAddressPopup(false);
    setShowOtpPopup(true);
  };

  const cancelFromSelectAddress = () => {
    console.log("AMAZON UI: Cancel from SelectAddress -> back to OTP popup");
    setShowSelectAddressPopup(false);
    setShowOtpPopup(true);
  };

  const cancelFromUpi = () => {
    console.log("AMAZON UI: Cancel from UPI -> back to address OR OTP");
    setShowUpiPopup(false);
    if (shippingAddresses.length > 0) setShowOtpPopup(true);
    else setShowAddressPopup(true);
  };

  const handleProceedFromSelectAddress = () => {
    setShowSelectAddressPopup(false);
    setShowUpiPopup(true);
  };

  return {
    // data
    sessionId,
    results,
    selectedProduct,
    details,
    canShowSizes,
    shippingAddresses,
    selectedAddressIndex,

    // form states
    selectedSize,
    setSelectedSize,
    phone,
    setPhone,
    otp,
    setOtp,
    upiId,
    setUpiId,
    address,
    setAddress,

    // popups
    showProductDetails,
    showSizePopup,
    showPhonePopup,
    showOtpPopup,
    showAddressPopup,
    showSelectAddressPopup,
    showUpiPopup,

    // loading
    loadingDetails,
    loadingCart,
    loadingLogin,
    loadingOtp,
    loadingAddress,
    loadingPayment,

    // actions
    resetCheckoutPopups,
    setShowProductDetails,
    setShowSizePopup,
    setShowPhonePopup,
    setShowOtpPopup,
    setShowAddressPopup,
    setShowSelectAddressPopup,
    setShowUpiPopup,
    setSelectedAddressIndex,
    setSessionFromOutside,

    handleSearch,
    handleOpenDetails,
    handleSizeContinue,
    handlePhoneContinue,
    handleOtpVerify,
    handleSaveAddress,
    handlePayWithUpi,
    handleSelectAddressAndPay,
    handleProceedFromSelectAddress,

    // cancels
    cancelFromSize,
    cancelFromPhone,
    cancelFromOtp,
    cancelFromAddress,
    cancelFromSelectAddress,
    cancelFromUpi,
  };
}
