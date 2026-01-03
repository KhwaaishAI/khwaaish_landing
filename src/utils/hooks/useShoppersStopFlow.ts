import { useMemo, useState } from "react";
import type {
  ShoppersStopAddAddressBody,
  ShoppersStopAddress,
  ShoppersStopBill,
  ShoppersStopProduct,
  ShoppersStopSize,
  ShoppersStopSignupBody,
  ShoppersStopViewResponse,
} from "../../types/shoppersstop";
import {
  shoppersstopAddAddress,
  shoppersstopAddToCart,
  shoppersstopPayment,
  shoppersstopSaveAddress,
  shoppersstopSignup,
  shoppersstopVerifyOtp,
  shoppersstopView,
} from "../api/shoppersstopApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
};

const EMPTY_SIGNUP: Omit<ShoppersStopSignupBody, "session_id"> = {
  name: "",
  email: "",
  gender: "Female",
};

const EMPTY_ADD_ADDRESS: Omit<ShoppersStopAddAddressBody, "session_id"> = {
  name: "",
  mobile: "",
  pincode: "",
  address: "",
  type: "Home",
};

export function useShoppersStopFlow({ BaseURL, pushSystem }: Opts) {
  const [pendingProduct, setPendingProduct] =
    useState<ShoppersStopProduct | null>(null);

  // product details + sizes
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [viewData, setViewData] = useState<ShoppersStopViewResponse | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState("");

  // add to cart requires phone
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState("");

  // otp
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");

  // signup
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signup, setSignup] = useState(EMPTY_SIGNUP);

  // addresses
  const [showSelectAddressPopup, setShowSelectAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState<ShoppersStopAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [addAddress, setAddAddress] = useState(EMPTY_ADD_ADDRESS);

  // payment
  const [showUpiPopup, setShowUpiPopup] = useState(false);
  const [upiId, setUpiId] = useState("");

  // shared bill (optional display)
  const [bill, setBill] = useState<ShoppersStopBill | null>(null);

  // loaders
  const [loadingAddToCart, setLoadingAddToCart] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingSaveAddress, setLoadingSaveAddress] = useState(false);
  const [loadingAddAddress, setLoadingAddAddress] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const sizesFallback = useMemo<string[]>(
    () => ["S", "M", "L", "XL", "XXL"],
    []
  );

  const closeAllPopups = () => {
    setShowProductPopup(false);
    setShowOtpPopup(false);
    setShowSignupPopup(false);
    setShowSelectAddressPopup(false);
    setShowAddAddressPopup(false);
    setShowUpiPopup(false);
  };

  const failAndCloseAll = (msg?: string) => {
    console.log("SHOPPERSSTOP FLOW failAndCloseAll:", msg);
    closeAllPopups();
    pushSystem(msg || "Error from Shoppers Stop server");
  };

  const openProductAndFetchSizes = async (p: ShoppersStopProduct) => {
    console.log("SHOPPERSSTOP FLOW product selected:", p);
    setPendingProduct(p);
    setSelectedSize("");
    setViewData(null);

    setShowProductPopup(true); // open immediately; loader covers content
    setLoadingView(true);

    try {
      const { res, data, body } = await shoppersstopView(BaseURL, p.url);
      console.log("SHOPPERSSTOP FLOW POST /api/shoppersstop/view body:", body);
      console.log("SHOPPERSSTOP FLOW /api/shoppersstop/view response:", data);

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Failed to fetch product sizes.");
        return;
      }

      setViewData(data);
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW view ERROR:", err);
      failAndCloseAll("Something went wrong while fetching product details.");
    } finally {
      setLoadingView(false);
    }
  };

  const handleAddToCart = async () => {
    console.log("SHOPPERSSTOP FLOW add-to-cart clicked:", {
      pendingProduct,
      selectedSize,
      phone,
    });

    if (!pendingProduct?.url)
      return pushSystem("Please select a product first.");
    if (!selectedSize) return pushSystem("Please select a size.");
    if (phone.replace(/\D/g, "").length !== 10)
      return pushSystem("Enter a valid 10-digit phone number.");

    setLoadingAddToCart(true);
    try {
      const { res, data, body } = await shoppersstopAddToCart(
        BaseURL,
        pendingProduct.url,
        selectedSize,
        phone
      );
      console.log("SHOPPERSSTOP FLOW POST /amazon/add-to-cart body:", body);
      console.log("SHOPPERSSTOP FLOW /amazon/add-to-cart response:", data);

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      const sid = String(data?.session_id || "");
      if (!sid) {
        failAndCloseAll("Session not received from server.");
        return;
      }

      setSessionId(sid);
      localStorage.setItem("shoppersstop_session_id", sid);

      // move to OTP popup
      setShowProductPopup(false);
      setShowOtpPopup(true);
      pushSystem("OTP sent. Please enter OTP to continue.");
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW add-to-cart ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  const verifyOtpAndContinue = async () => {
    console.log("SHOPPERSSTOP FLOW verifyOtp clicked:", { sessionId, otp });

    if (!sessionId) return pushSystem("Session missing. Please try again.");
    if (!otp.trim()) return pushSystem("Please enter OTP.");

    setLoadingVerifyOtp(true);
    try {
      const { res, data, body } = await shoppersstopVerifyOtp(
        BaseURL,
        sessionId,
        otp.trim()
      );
      console.log(
        "SHOPPERSSTOP FLOW POST /api/shoppersstop/verify-otp body:",
        body
      );
      console.log(
        "SHOPPERSSTOP FLOW /api/shoppersstop/verify-otp response:",
        data
      );

      if (!res.ok) {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      const status = String(data?.status || "").toLowerCase();
      const sid = String(data?.session_id || sessionId);
      if (sid && sid !== sessionId) setSessionId(sid);
      if (data?.bill) setBill(data.bill);

      if (status === "signup_required") {
        // go signup
        setShowOtpPopup(false);
        setShowSignupPopup(true);
        pushSystem("Signup required. Please complete signup to continue.");
        return;
      }

      if (status === "success") {
        // go save-address
        // setShowOtpPopup(false);
        await saveAddressAndContinue();
        return;
      }

      failAndCloseAll(data?.message || "Error from Shoppers Stop server");
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW verify-otp ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const submitSignupThenContinue = async () => {
    console.log("SHOPPERSSTOP FLOW signup submit:", { sessionId, signup });

    if (!sessionId) return pushSystem("Session missing. Please try again.");
    if (!signup.name.trim()) return pushSystem("Please enter name.");
    if (!signup.email.trim()) return pushSystem("Please enter email.");
    if (!signup.gender.trim()) return pushSystem("Please select gender.");

    setLoadingSignup(true);
    try {
      const payload: ShoppersStopSignupBody = {
        session_id: sessionId,
        ...signup,
      };
      const { res, data, body } = await shoppersstopSignup(BaseURL, payload);
      console.log(
        "SHOPPERSSTOP FLOW POST /api/shoppersstop/signup body:",
        body
      );
      console.log("SHOPPERSSTOP FLOW /api/shoppersstop/signup response:", data);

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      if (data?.bill) setBill(data.bill);

      //  keep signup popup open while loading addresses

      await saveAddressAndContinue();
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW signup ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingSignup(false);
    }
  };

  const saveAddressAndContinue = async () => {
    console.log("SHOPPERSSTOP FLOW save-address start:", { sessionId });

    if (!sessionId) return pushSystem("Session missing. Please try again.");

    // ensure OTP popup stays visible while we load addresses
    //  keep signup popup visible too (if we're in signup path)
    if (!showSignupPopup) {
      setShowOtpPopup(true);
    } else {
      setShowSignupPopup(true);
      setShowOtpPopup(false);
    }

    setLoadingSaveAddress(true);
    try {
      const { res, data, body } = await shoppersstopSaveAddress(
        BaseURL,
        sessionId
      );
      console.log(
        "SHOPPERSSTOP FLOW POST /api/shoppersstop/save-address body:",
        body
      );
      console.log(
        "SHOPPERSSTOP FLOW /api/shoppersstop/save-address response:",
        data
      );

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      if (data?.bill) setBill(data.bill);

      const list: ShoppersStopAddress[] = Array.isArray(data?.addresses)
        ? data.addresses
        : [];
      setAddresses(list);

      if (list.length === 0) {
        // open add-address popup
        // now switch popup (stop loader showing on OTP)
        setShowOtpPopup(false);
        setShowSignupPopup(false); //  added

        setShowAddAddressPopup(true);
        setShowSelectAddressPopup(false);
        pushSystem("No saved address found. Please add address.");
        return;
      }

      // open address selection popup
      setSelectedAddressId(list[0]?.address_id || "");

      // now switch popup (stop loader showing on OTP)
      setShowOtpPopup(false);
      setShowSignupPopup(false); //  added
      setShowSelectAddressPopup(true);
      setShowAddAddressPopup(false);

      pushSystem("Select address to continue.");

      setShowSelectAddressPopup(true);
      setShowAddAddressPopup(false);
      pushSystem("Select address to continue.");
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW save-address ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingSaveAddress(false);
    }
  };

  const submitAddAddressThenContinue = async () => {
    console.log("SHOPPERSSTOP FLOW add-address submit:", {
      sessionId,
      addAddress,
    });

    if (!sessionId) return pushSystem("Session missing. Please try again.");
    if (!addAddress.name.trim()) return pushSystem("Please enter name.");
    if (addAddress.mobile.replace(/\D/g, "").length !== 10)
      return pushSystem("Enter valid mobile number.");
    if (addAddress.pincode.replace(/\D/g, "").length !== 6)
      return pushSystem("Enter valid pincode.");
    if (!addAddress.address.trim()) return pushSystem("Enter address.");
    if (!addAddress.type.trim()) return pushSystem("Enter address type.");

    setLoadingAddAddress(true);
    try {
      const payload: ShoppersStopAddAddressBody = {
        session_id: sessionId,
        ...addAddress,
      };
      const { res, data, body } = await shoppersstopAddAddress(
        BaseURL,
        payload
      );
      console.log(
        "SHOPPERSSTOP FLOW POST /api/shoppersstop/add-address body:",
        body
      );
      console.log(
        "SHOPPERSSTOP FLOW /api/shoppersstop/add-address response:",
        data
      );

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      // After add-address success -> go to payment (as per your step 10)
      setShowAddAddressPopup(false);
      setShowUpiPopup(true);
      pushSystem("Address added. Now enter UPI ID to pay.");
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW add-address ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingAddAddress(false);
    }
  };

  const proceedAfterAddressSelected = () => {
    console.log("SHOPPERSSTOP FLOW address selected:", selectedAddressId);
    if (!selectedAddressId) return pushSystem("Please select an address.");
    setShowSelectAddressPopup(false);
    setShowUpiPopup(true);
    pushSystem("Now enter UPI ID to pay.");
  };

  const payNow = async () => {
    console.log("SHOPPERSSTOP FLOW payNow clicked:", {
      sessionId,
      selectedAddressId,
      upiId,
    });

    if (!sessionId) return pushSystem("Session missing. Please try again.");
    if (!selectedAddressId) return pushSystem("Please select an address.");
    if (!upiId.trim()) return pushSystem("Please enter UPI ID.");

    setLoadingPayment(true);
    try {
      const { res, data, body } = await shoppersstopPayment(BaseURL, {
        session_id: sessionId,
        address_id: selectedAddressId,
        upi_id: upiId.trim(),
      });

      console.log(
        "SHOPPERSSTOP FLOW POST /api/shoppersstop/payment body:",
        body
      );
      console.log(
        "SHOPPERSSTOP FLOW /api/shoppersstop/payment response:",
        data
      );

      if (!res.ok || String(data?.status).toLowerCase() !== "success") {
        failAndCloseAll(data?.message || "Error from Shoppers Stop server");
        return;
      }

      closeAllPopups();
      pushSystem("success");
    } catch (err) {
      console.log("SHOPPERSSTOP FLOW payment ERROR:", err);
      failAndCloseAll("Error from Shoppers Stop server");
    } finally {
      setLoadingPayment(false);
    }
  };

  // cancel/back helpers (must reopen previous popup with values)
  const backToProductFromOtp = () => {
    console.log("SHOPPERSSTOP FLOW backToProductFromOtp");
    setShowOtpPopup(false);
    setShowProductPopup(true);
  };

  const backToOtpFromSignup = () => {
    console.log("SHOPPERSSTOP FLOW backToOtpFromSignup");
    setShowSignupPopup(false);
    setShowOtpPopup(true);
  };

  const backToOtpFromAddressSelection = () => {
    console.log("SHOPPERSSTOP FLOW backToOtpFromAddressSelection");
    setShowSelectAddressPopup(false);
    setShowOtpPopup(true);
  };

  const backToOtpFromAddAddress = () => {
    console.log("SHOPPERSSTOP FLOW backToOtpFromAddAddress");
    setShowAddAddressPopup(false);
    setShowOtpPopup(true);
  };

  const backToAddressSelectionFromUpi = () => {
    console.log("SHOPPERSSTOP FLOW backToAddressSelectionFromUpi");
    setShowUpiPopup(false);
    if (addresses.length > 0) setShowSelectAddressPopup(true);
    else setShowAddAddressPopup(true);
  };

  const sizesToShow: string[] = viewData?.sizes?.length
    ? viewData.sizes.map((s: ShoppersStopSize) => s.label)
    : sizesFallback;

  return {
    // state
    pendingProduct,
    viewData,
    sizesToShow,

    selectedSize,
    setSelectedSize,

    phone,
    setPhone,

    sessionId,

    otp,
    setOtp,

    signup,
    setSignup,

    addresses,
    selectedAddressId,
    setSelectedAddressId,

    addAddress,
    setAddAddress,

    upiId,
    setUpiId,

    bill,

    // popups
    showProductPopup,
    setShowProductPopup,
    showOtpPopup,
    showSignupPopup,
    showSelectAddressPopup,
    showAddAddressPopup,
    showUpiPopup,

    // loaders
    loadingView,
    loadingAddToCart,
    loadingVerifyOtp,
    loadingSignup,
    loadingSaveAddress,
    loadingAddAddress,
    loadingPayment,

    // actions
    openProductAndFetchSizes,
    handleAddToCart,
    verifyOtpAndContinue,
    submitSignupThenContinue,
    saveAddressAndContinue,
    submitAddAddressThenContinue,
    proceedAfterAddressSelected,
    payNow,

    // back actions
    backToProductFromOtp,
    backToOtpFromSignup,
    backToOtpFromAddressSelection,
    backToOtpFromAddAddress,
    backToAddressSelectionFromUpi,

    // misc
    closeAllPopups,
  };
}
