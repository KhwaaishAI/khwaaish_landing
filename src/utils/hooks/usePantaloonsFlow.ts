import { useMemo, useState } from "react";
import type {
  PantaloonsAutomationRunBody,
  PantaloonsProduct,
  PantaloonsProductInfoResponse,
} from "../../types/pantaloons";
import {
  pantaloonsAutomationRun,
  pantaloonsGetProductInfo,
  pantaloonsLogin,
  pantaloonsSessionCheck,
  pantaloonsVerifyOtp,
} from "../api/pantaloonsApi";
import type { PantaloonsAddressUI } from "../../components/pantaloons/PantaloonsUpiAddressPopup";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
};

export function usePantaloonsFlow({ BaseURL, pushSystem }: Opts) {
  const [pendingProduct, setPendingProduct] =
    useState<PantaloonsProduct | null>(null);

  const [showPincodePopup, setShowPincodePopup] = useState(false);
  const [pincode, setPincode] = useState("");

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [productInfo, setProductInfo] =
    useState<PantaloonsProductInfoResponse | null>(null);

  const [showSizePopup, setShowSizePopup] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const [showPhoneOtpPopup, setShowPhoneOtpPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phonePhase, setPhonePhase] = useState<"CHECK" | "OTP">("CHECK");

  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);

  const [showUpiAddressPopup, setShowUpiAddressPopup] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const [address, setAddress] = useState<PantaloonsAddressUI>({
    fname: "",
    phone: "",
    pincode: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
  });

  const [loadingRun, setLoadingRun] = useState(false);

  const sizesFallback = useMemo(() => ["XS", "S", "M", "L", "XL", "XXL"], []);

  const openProductThenAskPincode = async (p: PantaloonsProduct) => {
    console.log("PANTALOONS FLOW product selected:", p);
    setPendingProduct(p);
    setProductInfo(null);
    setSelectedSize("");
    setPincode("");
    setShowPincodePopup(true);
    console.log("PANTALOONS FLOW pincode popup opened");
  };

  const submitPincodeAndFetchInfo = async () => {
    console.log("PANTALOONS FLOW submit pincode:", { pincode, pendingProduct });

    const pin = pincode.replace(/\D/g, "").slice(0, 6);
    if (pin.length !== 6) {
      pushSystem("Please enter a valid 6-digit pincode.");
      return;
    }
    if (!pendingProduct?.producturl) {
      pushSystem("Product missing. Please select a product again.");
      return;
    }

    setLoadingInfo(true);
    try {
      const { res, data } = await pantaloonsGetProductInfo(BaseURL, {
        product_url: pendingProduct.producturl,
        pincode: pin,
      });

      if (!res.ok) {
        pushSystem(
          data?.message || data?.detail || "Failed to fetch product info."
        );
        return;
      }

      setProductInfo(data);
      setShowPincodePopup(false);
      setShowSizePopup(true);
      console.log("PANTALOONS FLOW size popup opened after get_product_info");
    } catch (err) {
      console.log("PANTALOONS FLOW get_product_info ERROR:", err);
      pushSystem("Something went wrong while fetching product info.");
    } finally {
      setLoadingInfo(false);
    }
  };

  const continueAfterSize = async () => {
    console.log("PANTALOONS FLOW continue after size:", { selectedSize });

    if (!selectedSize) {
      pushSystem("Please select a size first.");
      return;
    }

    setShowSizePopup(false);
    setPhonePhase("CHECK");
    setShowPhoneOtpPopup(true);

    console.log("PANTALOONS FLOW phone popup opened (session check phase)");
  };

  const normalizePhone10 = (v: string) => v.replace(/\D/g, "").slice(0, 10);

  const autoSendOtpAndMoveToOtpPhase = async (ph: string) => {
    console.log("PANTALOONS FLOW autoSendOtpAndMoveToOtpPhase start:", ph);

    setLoadingSendOtp(true);
    try {
      const { res, data } = await pantaloonsLogin(BaseURL, ph);
      console.log("PANTALOONS FLOW auto OTP login response:", data);

      if (!res.ok) {
        pushSystem(data?.message || data?.detail || "Failed to send OTP.");
        return false;
      }

      pushSystem("OTP sent. Please enter OTP to verify.");
      setPhonePhase("OTP"); // show OTP input
      return true;
    } catch (err) {
      console.log("PANTALOONS FLOW auto login ERROR:", err);
      pushSystem("Something went wrong while sending OTP.");
      return false;
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const checkSession = async () => {
    console.log("PANTALOONS FLOW session/check called:", { phone });

    const ph = phone.replace(/\D/g, "").slice(0, 10);
    if (ph.length !== 10) {
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoadingCheck(true);
    try {
      const { res, data } = await pantaloonsSessionCheck(BaseURL, ph);

      console.log("PANTALOONS FLOW session/check http:", res.status, res.ok);
      console.log("PANTALOONS FLOW session/check data:", data);
      console.log("PANTALOONS FLOW session/check data:", data.logged_in);

      // IMPORTANT: if session/check endpoint is missing / returns 404
      // => fallback to OTP login flow
      if (res.status === 404 || data.logged_in === false) {
        console.log(
          "PANTALOONS FLOW session/check 404 -> fallback to OTP login flow"
        );
        pushSystem("Session check not available. Sending OTP...");
        setPhonePhase("OTP");
        await sendOtp(); // sends OTP to provided number
        return;
      }

      if (!res.ok) {
        // any other server failure => also fallback to OTP, per your requirement
        console.log(
          "PANTALOONS FLOW session/check not ok -> fallback to OTP login flow"
        );
        pushSystem(
          data?.message ||
            data?.detail ||
            "Session check failed. Sending OTP..."
        );
        setPhonePhase("OTP");
        await sendOtp();
        return;
      }

      const detail = String(data?.detail || "");
      const noSession =
        detail.includes("No saved session for this phone") ||
        detail.toLowerCase().includes("no saved session") ||
        data?.checkSession === false ||
        data?.session === false;

      if (noSession) {
        console.log("PANTALOONS FLOW no session -> send OTP");
        pushSystem("No saved session found. Sending OTP...");
        setPhonePhase("OTP");
        await sendOtp();
        return;
      }

      // Session exists => skip OTP and go to payment+address, then automation/run
      console.log("PANTALOONS FLOW session exists -> direct automation path");
      pushSystem("Session found. Continuing to payment & address.");
      setShowPhoneOtpPopup(false);
      setShowUpiAddressPopup(true);
    } catch (err) {
      // Network errors etc => fallback to OTP
      console.log(
        "PANTALOONS FLOW session/check ERROR -> fallback to OTP:",
        err
      );
      pushSystem("Session check failed. Sending OTP...");
      setPhonePhase("OTP");
      await sendOtp();
    } finally {
      setLoadingCheck(false);
    }
  };

  //   const sendOtp = async () => {
  //     console.log("PANTALOONS FLOW login called:", { phone });

  //     const ph = phone.replace(/\D/g, "").slice(0, 10);
  //     if (ph.length !== 10) {
  //       pushSystem("Please enter a valid 10-digit phone number.");
  //       return;
  //     }

  //     setLoadingSendOtp(true);
  //     try {
  //       const { res, data } = await pantaloonsLogin(BaseURL, ph);
  //       if (!res.ok) {
  //         pushSystem(data?.message || data?.detail || "Failed to send OTP.");
  //         return;
  //       }
  //       pushSystem("OTP sent. Please enter OTP to verify.");
  //       console.log("PANTALOONS FLOW OTP sent, switching to OTP phase");
  //       setPhonePhase("OTP");
  //     } catch (err) {
  //       console.log("PANTALOONS FLOW login ERROR:", err);
  //       pushSystem("Something went wrong while sending OTP.");
  //     } finally {
  //       setLoadingSendOtp(false);
  //     }
  //   };

  const sendOtp = async () => {
    console.log("PANTALOONS FLOW login called:", { phone });

    const ph = normalizePhone10(phone);
    if (ph.length !== 10) {
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }

    setPhonePhase("OTP");
    await autoSendOtpAndMoveToOtpPhase(ph);
  };

  const verifyOtp = async () => {
    console.log("PANTALOONS FLOW OTP_verify called:", { phone, otp });

    const ph = phone.replace(/\D/g, "").slice(0, 10);
    if (ph.length !== 10) {
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!otp.trim()) {
      pushSystem("Please enter OTP.");
      return;
    }

    setLoadingVerifyOtp(true);
    try {
      const { res, data } = await pantaloonsVerifyOtp(BaseURL, ph, otp.trim());
      if (!res.ok) {
        pushSystem(data?.message || data?.detail || "OTP verification failed.");
        return;
      }

      pushSystem("OTP verified. Continuing to payment & address.");
      setShowPhoneOtpPopup(false);
      setShowUpiAddressPopup(true);
      console.log(
        "PANTALOONS FLOW upi+address popup opened (after OTP verify)"
      );
    } catch (err) {
      console.log("PANTALOONS FLOW OTP_verify ERROR:", err);
      pushSystem("Something went wrong while verifying OTP.");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const runAutomation = async () => {
    console.log("PANTALOONS FLOW automation/run clicked");

    if (!pendingProduct?.producturl) {
      pushSystem("Product missing. Please select product again.");
      return;
    }
    if (!selectedSize) {
      pushSystem("Size missing. Please select size again.");
      return;
    }

    const ph = phone.replace(/\D/g, "").slice(0, 10);
    if (ph.length !== 10) {
      pushSystem("Phone missing/invalid. Please re-enter phone.");
      setShowUpiAddressPopup(false);
      setPhonePhase("CHECK");
      setShowPhoneOtpPopup(true);
      return;
    }

    const cleanedUpi = upiId.trim();
    if (!cleanedUpi) {
      pushSystem("Please enter a valid UPI ID.");
      return;
    }

    if (!address.fname.trim() || !address.building.trim()) {
      pushSystem("Please fill name and building/house.");
      return;
    }
    if (address.phone.replace(/\D/g, "").length !== 10) {
      pushSystem("Please enter a valid 10-digit address phone.");
      return;
    }
    if (address.pincode.replace(/\D/g, "").length !== 6) {
      pushSystem("Please enter a valid 6-digit address pincode.");
      return;
    }

    const payload: PantaloonsAutomationRunBody = {
      phone: ph,
      product: {
        product_url: pendingProduct.producturl,
        size: selectedSize,
        quantity: 1,
      },
      coupon: couponCode.trim()
        ? { coupon_code: couponCode.trim() }
        : { coupon_code: "" },
      address: {
        old_user: false,
        change_address: false,
        new_user: true,
        fname: address.fname,
        phone: address.phone.replace(/\D/g, "").slice(0, 10),
        pincode: address.pincode.replace(/\D/g, "").slice(0, 6),
        building: address.building,
        street: address.street || "",
        area: address.area || "",
        landmark: address.landmark || "",
      },
      payment: {
        upi_id: cleanedUpi,
      },
    };

    setLoadingRun(true);
    try {
      const { res, data } = await pantaloonsAutomationRun(BaseURL, payload);

      console.log("PANTALOONS FLOW automation/run http:", res.status, res.ok);
      console.log("PANTALOONS FLOW automation/run data:", data);

      if (!res.ok) {
        // CLOSE POPUP on error (as requested)
        setShowUpiAddressPopup(false);

        const msg =
          data?.message ||
          data?.detail ||
          data?.error ||
          `Error from Pantaloons server (HTTP ${res.status})`;

        console.log("PANTALOONS FLOW automation/run FAILED msg:", msg);
        pushSystem(msg);
        return;
      }

      const status = String(data?.status || "");
      if (
        status.toLowerCase().includes("success") ||
        status.toLowerCase().includes("confirmed")
      ) {
        pushSystem("success");
      } else {
        pushSystem(
          data?.status || data?.detail || "Order placed (status unknown)."
        );
      }

      setShowUpiAddressPopup(false);
      console.log("PANTALOONS FLOW automation complete:", data);
    } catch (err: any) {
      console.log("PANTALOONS FLOW automation/run ERROR:", err);

      // CLOSE POPUP on error (as requested)
      setShowUpiAddressPopup(false);

      pushSystem(
        `Error from Pantaloons server: ${err?.message || "Unknown error"}`
      );
    } finally {
      setLoadingRun(false);
    }
  };

  const sizesToShow = productInfo?.sizes?.length
    ? productInfo.sizes
    : sizesFallback;

  return {
    // state
    pendingProduct,

    showPincodePopup,
    pincode,
    loadingInfo,
    productInfo,

    showSizePopup,
    selectedSize,
    sizesToShow,

    showPhoneOtpPopup,
    phonePhase,
    phone,
    otp,
    loadingCheck,
    loadingSendOtp,
    loadingVerifyOtp,

    showUpiAddressPopup,
    upiId,
    couponCode,
    address,
    loadingRun,

    // setters
    setShowPincodePopup,
    setPincode,

    setShowSizePopup,
    setSelectedSize,

    setShowPhoneOtpPopup,
    setPhone,
    setOtp,

    setShowUpiAddressPopup,
    setUpiId,
    setCouponCode,
    setAddress,

    // actions
    openProductThenAskPincode,
    submitPincodeAndFetchInfo,
    continueAfterSize,
    checkSession,
    sendOtp,
    verifyOtp,
    runAutomation,
  };
}
