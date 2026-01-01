import { useMemo, useState } from "react";
import type {
  WestsideAddress,
  WestsideProduct,
  WestsideViewResponse,
} from "../../types/westside";
import {
  westsideAccountCheck,
  westsideAddToCart,
  westsideBuyWithAddress,
  westsideLogin,
  westsideVerifyOtp,
  westsideView,
} from "../api/westsideApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
};

export function useWestsideFlow({ BaseURL, pushSystem }: Opts) {
  const [pendingProduct, setPendingProduct] = useState<WestsideProduct | null>(
    null
  );

  const [showSizePopup, setShowSizePopup] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  const [viewData, setViewData] = useState<WestsideViewResponse | null>(null);

  const [selectedSize, setSelectedSize] = useState("");

  const [sessionId, setSessionId] = useState<string>("");

  const [showUpiPopup, setShowUpiPopup] = useState(false);
  const [upiId, setUpiId] = useState("");

  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [address, setAddress] = useState<WestsideAddress>({
    address_id: "",
    first_name: "",
    last_name: "",
    address1: "",
    address2: "",
    city: "",
    state_code: "",
    pincode: "",
    phone: "",
  });

  const [showLoginOtpPopup, setShowLoginOtpPopup] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [loadingAddToCart, setLoadingAddToCart] = useState(false);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const sizesFallback = useMemo(() => ["XS", "S", "M", "L", "XL", "XXL"], []);

  const openProductAndFetchSizes = async (p: WestsideProduct) => {
    console.log("WESTSIDE FLOW product selected", p);
    setPendingProduct(p);
    setSelectedSize("");
    setViewData(null);

    setLoadingView(true);
    try {
      const { res, data, body } = await westsideView(BaseURL, p.product_url);
      console.log("WESTSIDE FLOW POST /api/westside/view body", body);
      console.log("WESTSIDE FLOW /api/westside/view response", data);

      if (!res.ok) {
        pushSystem(data?.message || "Failed to fetch product details.");
        return;
      }

      setViewData(data);
      setShowSizePopup(true);
      console.log("WESTSIDE FLOW size popup opened");
    } catch (err) {
      console.log("WESTSIDE FLOW view ERROR", err);
      pushSystem("Something went wrong while fetching product details.");
    } finally {
      setLoadingView(false);
    }
  };

  //   const handleAddToCartThenOpenAddress = async () => {
  //     console.log("WESTSIDE FLOW Add-to-cart clicked");
  //     console.log("WESTSIDE FLOW pendingProduct", pendingProduct);
  //     console.log("WESTSIDE FLOW selectedSize", selectedSize);

  //     if (!pendingProduct?.product_url || !selectedSize) {
  //       console.log("WESTSIDE FLOW BLOCKED pendingProduct/selectedSize missing");
  //       pushSystem("Please select a product and size first.");
  //       return;
  //     }

  //     setLoadingAddToCart(true);
  //     try {
  //       const { res, data, body } = await westsideAddToCart(
  //         BaseURL,
  //         pendingProduct.product_url,
  //         selectedSize
  //       );
  //       console.log("WESTSIDE FLOW POST /api/westside/add-to-cart body", body);
  //       console.log("WESTSIDE FLOW /api/westside/add-to-cart response", data);

  //       if (!res.ok) {
  //         pushSystem(data?.message || "Failed to add to cart.");
  //         return;
  //       }

  //       const returnedSessionId = String(data?.session_id || "");
  //       if (!returnedSessionId) {
  //         pushSystem("Session not received. Please try again.");
  //         return;
  //       }

  //       console.log("WESTSIDE FLOW Saving sessionId", returnedSessionId);
  //       setSessionId(returnedSessionId);
  //       localStorage.setItem("westsidesessionid", returnedSessionId);

  //       setShowSizePopup(false);

  //       // Ask for UPI + address always (because buy-with-address needs them)
  //       setShowAddressPopup(true);
  //       console.log("WESTSIDE FLOW Address popup opened (before UPI)");

  //       pushSystem("Item added to cart. Please enter UPI ID to continue.");
  //     } catch (err) {
  //       console.log("WESTSIDE FLOW add-to-cart ERROR", err);
  //       pushSystem("Failed to add to cart. Please try again.");
  //     } finally {
  //       setLoadingAddToCart(false);
  //     }
  //   };

  const handleAddToCartThenAccountCheck = async () => {
    console.log("WESTSIDE FLOW Add-to-cart clicked");
    console.log("WESTSIDE FLOW pendingProduct", pendingProduct);
    console.log("WESTSIDE FLOW selectedSize", selectedSize);

    if (!pendingProduct?.product_url || !selectedSize) {
      console.log("WESTSIDE FLOW BLOCKED pendingProduct/selectedSize missing");
      pushSystem("Please select a product and size first.");
      return;
    }

    setLoadingAddToCart(true);
    try {
      const { res, data, body } = await westsideAddToCart(
        BaseURL,
        pendingProduct.product_url,
        selectedSize
      );
      console.log("WESTSIDE FLOW POST /api/westside/add-to-cart body", body);
      console.log("WESTSIDE FLOW /api/westside/add-to-cart response", data);

      if (!res.ok) {
        pushSystem(data?.message || "Failed to add to cart.");
        return;
      }

      const returnedSessionId = String(data?.session_id || "");
      if (!returnedSessionId) {
        pushSystem("Session not received. Please try again.");
        return;
      }

      console.log("WESTSIDE FLOW Saving sessionId", returnedSessionId);
      setSessionId(returnedSessionId);
      localStorage.setItem("westsidesessionid", returnedSessionId);

      setShowSizePopup(false);

      // ✅ ACCOUNT CHECK IMMEDIATELY AFTER ADD-TO-CART
      console.log(
        "WESTSIDE FLOW Running account-check right after add-to-cart..."
      );
      const ac = await westsideAccountCheck(BaseURL, returnedSessionId);
      console.log(
        "WESTSIDE FLOW POST /api/westside/account-check body",
        ac.body
      );
      console.log(
        "WESTSIDE FLOW /api/westside/account-check response",
        ac.data
      );

      if (!ac.res.ok) {
        pushSystem(ac.data?.message || "Account check failed.");
        return;
      }

      const hasSaved = Boolean(ac.data?.has_saved_account);
      console.log("WESTSIDE FLOW has_saved_account", hasSaved);

      if (hasSaved) {
        // user has account context -> proceed to collect address+upi then buy
        setShowAddressPopup(true);
        console.log("WESTSIDE FLOW Address popup opened (saved account)");
        pushSystem("Account found. Please enter address to continue.");
      } else {
        // no account -> login first
        setShowLoginOtpPopup(true);
        console.log("WESTSIDE FLOW Login OTP popup opened (no saved account)");
        pushSystem("Please login to continue (OTP).");
      }
    } catch (err) {
      console.log("WESTSIDE FLOW add-to-cart/account-check ERROR", err);
      pushSystem("Failed to add to cart. Please try again.");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  //   const handleUpiSubmitThenAccountCheck = async () => {
  //     console.log("WESTSIDE FLOW UPI submitted", { upiId, sessionId });

  //     const cleanedUpi = upiId.trim();
  //     if (!cleanedUpi) {
  //       pushSystem("Please enter a valid UPI ID.");
  //       return;
  //     }
  //     if (!sessionId) {
  //       pushSystem("Session missing. Please add item to cart again.");
  //       return;
  //     }

  //     setShowUpiPopup(false);

  //     console.log("WESTSIDE FLOW Running account-check after UPI...");
  //     setLoadingBuy(true);
  //     try {
  //       const { res, data, body } = await westsideAccountCheck(
  //         BaseURL,
  //         sessionId
  //       );
  //       console.log("WESTSIDE FLOW POST /api/westside/account-check body", body);
  //       console.log("WESTSIDE FLOW /api/westside/account-check response", data);

  //       if (!res.ok) {
  //         pushSystem(data?.message || "Account check failed.");
  //         setShowUpiPopup(true);
  //         return;
  //       }

  //       const hasSaved = Boolean(data?.has_saved_account);
  //       console.log("WESTSIDE FLOW has_saved_account", hasSaved);

  //       if (hasSaved) {
  //         await buyWithAddress();
  //       } else {
  //         setShowLoginOtpPopup(true);
  //         console.log("WESTSIDE FLOW Login OTP popup opened");
  //         pushSystem("Please login to continue (OTP).");
  //       }
  //       //   console.log("WESTSIDE FLOW account-check has_saved_account", hasSaved);
  //       //   console.log(
  //       //     "WESTSIDE FLOW address_id is empty -> forcing OTP flow to avoid saved-account automation path"
  //       //   );

  //       //   setShowLoginOtpPopup(true);
  //       //   console.log("WESTSIDE FLOW Login OTP popup opened (forced)");
  //       //   pushSystem("Please login to continue (OTP).");
  //     } catch (err) {
  //       console.log("WESTSIDE FLOW account-check ERROR", err);
  //       pushSystem("Something went wrong during account check.");
  //       setShowUpiPopup(true);
  //     } finally {
  //       setLoadingBuy(false);
  //     }
  //   };

  const handleAddressSaveThenAccountCheck = async () => {
    console.log("WESTSIDE FLOW Address saved. Opening UPI popup...");
    console.log("WESTSIDE FLOW address", address);

    if (!sessionId) {
      pushSystem("Session missing. Please add item to cart again.");
      return;
    }

    if (
      !address.first_name.trim() ||
      !address.last_name.trim() ||
      !address.address1.trim()
    ) {
      pushSystem("Please fill first name, last name and address line 1.");
      return;
    }
    if (address.phone.replace(/\D/g, "").length !== 10) {
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }
    if (address.pincode.replace(/\D/g, "").length !== 6) {
      pushSystem("Please enter a valid 6-digit pincode.");
      return;
    }
    if (!address.city.trim() || !address.state_code.trim()) {
      pushSystem("Please fill city and state code.");
      return;
    }

    setShowAddressPopup(false);
    setShowUpiPopup(true);
    console.log("WESTSIDE FLOW UPI popup opened (after address)");
    pushSystem("Now enter UPI ID to continue.");
  };

  //   const handleAddressSaveThenOpenUpi = async () => {
  //     console.log("WESTSIDE FLOW Address saved. Running account-check...");
  //     console.log("WESTSIDE FLOW address", address);

  //     if (!sessionId) {
  //       pushSystem("Session missing. Please add item to cart again.");
  //       return;
  //     }

  //     // Basic validation (keep it simple)
  //     if (
  //       !address.first_name.trim() ||
  //       !address.last_name.trim() ||
  //       !address.address1.trim()
  //     ) {
  //       pushSystem("Please fill first name, last name and address line 1.");
  //       return;
  //     }
  //     if (address.phone.replace(/\D/g, "").length !== 10) {
  //       pushSystem("Please enter a valid 10-digit phone number.");
  //       return;
  //     }
  //     if (address.pincode.replace(/\D/g, "").length !== 6) {
  //       pushSystem("Please enter a valid 6-digit pincode.");
  //       return;
  //     }
  //     if (!address.city.trim() || !address.state_code.trim()) {
  //       pushSystem("Please fill city and state code.");
  //       return;
  //     }

  //     setLoadingBuy(true);
  //     console.log("WESTSIDE FLOW Address saved. Opening UPI popup next...");
  //     setShowAddressPopup(false);

  //     setShowUpiPopup(true);
  //     console.log("WESTSIDE FLOW UPI popup opened (after address)");

  //     pushSystem("Now enter UPI ID to continue.");
  //     return;
  //   };

  const proceedAfterUpi = async () => {
    console.log("WESTSIDE FLOW UPI submitted", { upiId, sessionId });

    const cleanedUpi = upiId.trim();
    if (!cleanedUpi) {
      pushSystem("Please enter a valid UPI ID.");
      return;
    }
    if (!sessionId) {
      pushSystem("Session missing. Please add item to cart again.");
      return;
    }

    setShowUpiPopup(false);

    console.log("WESTSIDE FLOW Calling buyWithAddress after UPI...");
    await buyWithAddress();
  };

  const sendOtp = async () => {
    console.log("WESTSIDE FLOW Send OTP clicked", { sessionId, mobile });

    if (!sessionId) {
      pushSystem("Session missing. Please add item to cart again.");
      return;
    }
    if (mobile.replace(/\D/g, "").length !== 10) {
      pushSystem("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoadingSendOtp(true);
    try {
      const { res, data, body } = await westsideLogin(
        BaseURL,
        sessionId,
        mobile
      );
      console.log("WESTSIDE FLOW POST /api/westside/login body", body);
      console.log("WESTSIDE FLOW /api/westside/login response", data);

      if (!res.ok) {
        pushSystem(data?.message || "Login failed.");
        return;
      }

      //   const newSession = String(data?.session_id || sessionId);
      //   console.log("WESTSIDE FLOW login returned session", newSession);
      //   setSessionId(newSession);
      //   localStorage.setItem("westsidesessionid", newSession);
      const newSession = String(data?.session_id || "");
      console.log("WESTSIDE LOGIN returned session_id", newSession);

      if (newSession) {
        setSessionId(newSession);
        // optional persistence:
        localStorage.setItem("westsidesessionid", newSession);
      } else {
        console.log("WESTSIDE LOGIN WARNING: session_id missing in response");
      }

      pushSystem("OTP sent. Please enter OTP to verify.");
    } catch (err) {
      console.log("WESTSIDE FLOW login ERROR", err);
      pushSystem("Failed to send OTP. Please try again.");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const verifyOtp = async () => {
    console.log("WESTSIDE FLOW Verify OTP clicked", { sessionId, otp });

    if (!sessionId) {
      pushSystem("Session missing. Please add item to cart again.");
      return;
    }
    if (!otp.trim()) {
      pushSystem("Please enter OTP.");
      return;
    }

    setLoadingVerifyOtp(true);
    try {
      const { res, data, body } = await westsideVerifyOtp(
        BaseURL,
        sessionId,
        otp
      );
      console.log("WESTSIDE FLOW POST /api/westside/verify-otp body", body);
      console.log("WESTSIDE FLOW /api/westside/verify-otp response", data);

      if (!res.ok) {
        pushSystem(data?.message || "OTP verification failed.");
        return;
      }

      const status = String(data?.status || "").toLowerCase();
      console.log("WESTSIDE FLOW verify status", status);

      setShowLoginOtpPopup(false);

      await buyWithAddress();
    } catch (err) {
      console.log("WESTSIDE FLOW verify-otp ERROR", err);
      pushSystem("Failed to verify OTP. Please try again.");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const buyWithAddress = async () => {
    console.log("WESTSIDE FLOW buyWithAddress started", {
      sessionId,
      upiId,
      address,
    });

    const cleanedUpi = upiId.trim();
    if (!sessionId) {
      pushSystem("Session missing.");
      return;
    }
    if (!cleanedUpi) {
      pushSystem("UPI missing. Please enter UPI again.");
      setShowUpiPopup(true);
      return;
    }

    const payload = {
      session_id: sessionId,
      upi_id: cleanedUpi,
      ...address,
      address2: address.address2 || "",
      state_code: address.state_code.toUpperCase(),
      pincode: address.pincode.replace(/\D/g, "").slice(0, 6),
      phone: address.phone.replace(/\D/g, "").slice(0, 10),
    };

    setLoadingBuy(true);
    try {
      const { res, data, body } = await westsideBuyWithAddress(
        BaseURL,
        payload
      );
      console.log(
        "WESTSIDE FLOW POST /api/westside/buy-with-address body",
        body
      );
      console.log(
        "WESTSIDE FLOW /api/westside/buy-with-address response",
        data
      );

      if (!res.ok) {
        pushSystem(data?.message || "Order failed. Please try again.");
        return;
      }

      const status = String(data?.status || "").toLowerCase();
      if (status.includes("success") || status.includes("confirmed")) {
        pushSystem("success");
      } else {
        pushSystem(data?.status || "Order placed (status unknown).");
      }
    } catch (err) {
      console.log("WESTSIDE FLOW buy-with-address ERROR", err);
      pushSystem("Order failed. Please try again.");
    } finally {
      setLoadingBuy(false);
    }
  };

  return {
    // state
    pendingProduct,
    viewData,
    showSizePopup,
    selectedSize,
    loadingView,
    loadingAddToCart,

    showUpiPopup,
    upiId,

    showAddressPopup,
    address,

    showLoginOtpPopup,
    mobile,
    otp,

    loadingSendOtp,
    loadingVerifyOtp,
    loadingBuy,

    sizesFallback,
    sessionId,

    // setters
    setSelectedSize,
    setShowSizePopup,
    setUpiId,
    setShowUpiPopup,
    setAddress,
    setShowAddressPopup,
    setMobile,
    setOtp,
    setShowLoginOtpPopup,

    // actions
    openProductAndFetchSizes,
    handleAddToCartThenAccountCheck,
    handleAddressSaveThenAccountCheck,
    proceedAfterUpi,
    sendOtp,
    verifyOtp,
  };
}
