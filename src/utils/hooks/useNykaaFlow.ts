import { useMemo, useState } from "react";
import type {
  NykaaAddress,
  NykaaProduct,
  PendingNykaaCart,
} from "../../types/nykaa";
import { nykaaAddToCart, nykaaPayment } from "../api/nykaaApi";

export function useNykaaFlow(opts: {
  BaseURL: string;
  pushSystem: (t: string) => void;
}) {
  const { BaseURL, pushSystem } = opts;

  const [pendingProduct, setPendingProduct] = useState<NykaaProduct | null>(
    null
  );
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const [pendingNykaaCart, setPendingNykaaCart] =
    useState<PendingNykaaCart | null>(null);

  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [nykaaAddress, setNykaaAddress] = useState<NykaaAddress>({
    pincode: "",
    house: "",
    area: "",
    name: "",
    phone: "",
    email: "",
  });

  const [showUpiPopup, setShowUpiPopup] = useState(false);
  const [upiId, setUpiId] = useState("");

  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [sessionId, setSessionId] = useState<string>(
    () => localStorage.getItem("nykaa_session_id") || ""
  );

  const sizesFallback = useMemo(
    () => ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    []
  );

  const openSizeForProduct = (p: NykaaProduct) => {
    console.log("NYKAA FLOW: product selected =", p);
    setPendingProduct(p);
    setSelectedSize("");
    setShowSizePopup(true);
    console.log("NYKAA FLOW: size popup opened");
  };

  const openAddressPopupForCart = () => {
    console.log("NYKAA FLOW: Add-to-cart clicked inside Size popup");
    console.log("NYKAA FLOW: pendingProduct =", pendingProduct);
    console.log("NYKAA FLOW: selectedSize =", selectedSize);

    if (!pendingProduct || !selectedSize) {
      console.log("NYKAA FLOW BLOCKED: pendingProduct/selectedSize missing");
      pushSystem("Please select a product and size first.");
      return;
    }

    const payload = { product_name: pendingProduct.name, size: selectedSize };
    setPendingNykaaCart(payload);
    console.log("NYKAA FLOW: Saved pendingNykaaCart =", payload);

    setShowSizePopup(false);
    console.log("NYKAA FLOW: Closed Size popup");

    setShowAddressPopup(true);
    console.log("NYKAA FLOW: Opened Address popup");
  };

  const handleNykaaAddToCart = async () => {
    console.log("NYKAA FLOW: Save Address & Continue clicked");
    console.log("NYKAA FLOW: pendingNykaaCart =", pendingNykaaCart);
    console.log("NYKAA FLOW: nykaaAddress =", nykaaAddress);

    if (!pendingNykaaCart) {
      console.log("NYKAA FLOW BLOCKED: pendingNykaaCart is null");
      pushSystem("Please select product & size again.");
      return;
    }

    const { pincode, house, area, name, phone, email } = nykaaAddress;

    if (!name.trim() || !house.trim() || !area.trim()) {
      console.log("NYKAA FLOW BLOCKED: name/house/area missing");
      pushSystem("Please fill name, house and area.");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      console.log("NYKAA FLOW BLOCKED: phone invalid =", phone);
      pushSystem("Please enter a valid 10-digit phone number.");
      return;
    }
    if (pincode.replace(/\D/g, "").length !== 6) {
      console.log("NYKAA FLOW BLOCKED: pincode invalid =", pincode);
      pushSystem("Please enter a valid 6-digit pincode.");
      return;
    }
    if (!email.includes("@")) {
      console.log("NYKAA FLOW BLOCKED: email invalid =", email);
      pushSystem("Please enter a valid email.");
      return;
    }

    setLoadingCart(true);
    try {
      const { res, data, body } = await nykaaAddToCart(
        BaseURL,
        pendingNykaaCart,
        nykaaAddress
      );

      console.log("NYKAA FLOW: POST /api/nykaa/add-to-cart body =", body);
      console.log("NYKAA FLOW: /api/nykaa/add-to-cart response =", data);

      if (!res.ok) {
        console.log("NYKAA FLOW: API failed, res.status =", res.status);
        pushSystem(data?.message || "Failed to add to cart. Please try again.");
        return;
      }

      const returnedSessionId =
        data?.session_id || data?.sessionid || data?.sessionId;
      if (!returnedSessionId) {
        console.log(
          "NYKAA FLOW: session_id missing, not proceeding to payment"
        );
        pushSystem(
          "Added to cart failed: session_id not received. Please try again."
        );
        return;
      }

      console.log("NYKAA FLOW: Saving sessionId =", returnedSessionId);
      setSessionId(String(returnedSessionId));

      setShowAddressPopup(false);
      console.log("NYKAA FLOW: Closed Address popup");

      setUpiId("");
      setShowUpiPopup(true);
      console.log("NYKAA FLOW: UPI popup opened");

      pushSystem("Item added to cart successfully!");
    } catch (err) {
      console.log("NYKAA FLOW ERROR:", err);
      pushSystem("Failed to add to cart. Please try again.");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleNykaaUpiSubmit = async () => {
    console.log("NYKAA UPI FLOW: Pay Now clicked");
    console.log("NYKAA UPI FLOW: upiId =", upiId);
    console.log("NYKAA UPI FLOW: sessionId =", sessionId);

    const cleanedUpi = (upiId || "").trim();
    if (!cleanedUpi) {
      console.log("NYKAA UPI FLOW BLOCKED: UPI ID missing");
      pushSystem("Please enter a valid UPI ID.");
      return;
    }
    if (!sessionId) {
      console.log("NYKAA UPI FLOW BLOCKED: sessionId missing");
      pushSystem("Session missing. Please add item to cart again.");
      return;
    }

    setLoadingPayment(true);
    try {
      const { res, data, body } = await nykaaPayment(
        BaseURL,
        sessionId,
        cleanedUpi
      );

      console.log("NYKAA UPI FLOW: POST /api/nykaa/payment body =", body);
      console.log("NYKAA UPI FLOW: /api/nykaa/payment response =", data);

      if (!res.ok) {
        console.log("NYKAA UPI FLOW: Payment failed, res.status =", res.status);
        pushSystem(data?.message || "Order failed. Please try again.");
        return;
      }

      const status = String(data?.status || "").toLowerCase();
      const isSuccess =
        status === "success" ||
        status === "confirmed" ||
        data?.order_confirmed === true ||
        data?.orderconfirmed === true;

      if (isSuccess) {
        console.log("NYKAA UPI FLOW: Order confirmed");
        setShowUpiPopup(false);
        pushSystem("success"); // triggers existing "Order Confirmed" UI if you keep it
      } else {
        console.log(
          "NYKAA UPI FLOW: Order not confirmed, status =",
          data?.status
        );
        pushSystem(data?.message || "Order failed. Please try again.");
      }
    } catch (err) {
      console.log("NYKAA UPI FLOW ERROR:", err);
      pushSystem("Order failed. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  return {
    // state
    pendingProduct,
    showSizePopup,
    selectedSize,
    showAddressPopup,
    nykaaAddress,
    showUpiPopup,
    upiId,
    loadingCart,
    loadingPayment,
    sessionId,
    sizesFallback,

    // setters
    setSelectedSize,
    setShowSizePopup,
    setNykaaAddress,
    setShowAddressPopup,
    setUpiId,
    setShowUpiPopup,

    // actions
    openSizeForProduct,
    openAddressPopupForCart,
    handleNykaaAddToCart,
    handleNykaaUpiSubmit,
  };
}
