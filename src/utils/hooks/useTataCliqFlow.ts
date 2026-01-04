import { useMemo, useState } from "react";
import type {
  TataCliqProduct,
  TataCliqViewResponse,
} from "../../types/tatacliq";
import { tatacliqAddToCart, tatacliqView } from "../api/tatacliqApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
};

export default function useTataCliqFlow({ BaseURL, pushSystem }: Opts) {
  const [pendingProduct, setPendingProduct] = useState<TataCliqProduct | null>(
    null
  );

  const [showProductPopup, setShowProductPopup] = useState(false);

  const [loadingView, setLoadingView] = useState(false);
  const [viewData, setViewData] = useState<TataCliqViewResponse | null>(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState<string>("");

  const [loadingAddToCart, setLoadingAddToCart] = useState(false);

  const closeAllPopups = () => {
    console.log("TATACLIQ FLOW closeAllPopups");
    setShowProductPopup(false);
  };

  const failAndCloseAll = (msg?: string) => {
    console.log("TATACLIQ FLOW failAndCloseAll:", msg);
    closeAllPopups();
    pushSystem(msg || "Error from TataCliq server.");
  };

  const openProductAndFetchSizes = async (p: TataCliqProduct) => {
    console.log("TATACLIQ FLOW product selected:", p);

    setPendingProduct(p);
    setSelectedSize("");
    setSessionId("");
    setViewData(null);

    // open immediately (so UI isn't blank) and show loader overlay while fetching sizes
    setShowProductPopup(true);
    setLoadingView(true);

    try {
      const { res, data, body } = await tatacliqView(BaseURL, p.url);
      console.log("TATACLIQ FLOW POST /api/tatacliq/view body:", body);
      console.log("TATACLIQ FLOW /api/tatacliq/view response:", data);

      const ok =
        res.ok && String(data?.status || "").toLowerCase() === "success";
      if (!ok) {
        failAndCloseAll(
          data?.message || "Failed to fetch sizes from TataCliq."
        );
        return;
      }

      setViewData(data);
    } catch (err) {
      console.log("TATACLIQ FLOW view ERROR:", err);
      failAndCloseAll("Something went wrong while fetching product sizes.");
    } finally {
      setLoadingView(false);
    }
  };

  const handleAddToCart = async () => {
    console.log("TATACLIQ FLOW add-to-cart clicked:", {
      pendingProduct,
      selectedSize,
      phone,
    });

    if (!pendingProduct?.url)
      return pushSystem("Please select a product first.");
    if (!selectedSize) return pushSystem("Please select a size.");

    const cleaned = phone.replace(/\D/g, "").slice(0, 10);
    if (cleaned.length !== 10)
      return pushSystem("Enter a valid 10-digit phone number.");

    setLoadingAddToCart(true);

    try {
      const { res, data, body } = await tatacliqAddToCart(
        BaseURL,
        pendingProduct.url,
        selectedSize,
        cleaned
      );

      console.log("TATACLIQ FLOW POST /api/tatacliq/add-to-cart body:", body);
      console.log("TATACLIQ FLOW /api/tatacliq/add-to-cart response:", data);

      const ok =
        res.ok && String(data?.status || "").toLowerCase() === "success";
      if (!ok) {
        failAndCloseAll(data?.message || "Error from TataCliq server.");
        return;
      }

      const sid = String(data?.session_id || "");
      if (!sid) {
        failAndCloseAll("session_id not received from server.");
        return;
      }

      setSessionId(sid);
      closeAllPopups();

      pushSystem(`success: TataCliq add-to-cart completed. session_id=${sid}`);
    } catch (err) {
      console.log("TATACLIQ FLOW add-to-cart ERROR:", err);
      failAndCloseAll("Something went wrong while adding to cart.");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  // Cancel button behavior: since this flow has only one popup,
  // cancel means close and user returns to previous view (grid/chat) with all values preserved in state.
  const cancelProductPopup = () => {
    console.log(
      "TATACLIQ FLOW cancelProductPopup (close details, keep values)"
    );
    setShowProductPopup(false);
  };

  const sizesToShow = useMemo(() => {
    const arr = Array.isArray(viewData?.sizes) ? viewData!.sizes : [];
    return arr.filter(Boolean);
  }, [viewData]);

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

    // popups
    showProductPopup,
    setShowProductPopup,

    // loaders
    loadingView,
    loadingAddToCart,

    // actions
    openProductAndFetchSizes,
    handleAddToCart,
    cancelProductPopup,
    closeAllPopups,
  };
}
