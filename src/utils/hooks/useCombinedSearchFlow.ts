import { useCallback } from "react";
import useAmazonFlow from "./useAmazonFlow";
import { useFlipkartFlow } from "./useFlipkartFlow";

import type { AmazonSearchResultItem } from "../../types/amazon";
import type { FlipkartProduct } from "../../types/flipkart";
import { flipkartSearch } from "../api/flipkartApi";
import { amazonSearch } from "../api/amazonApi";

type Opts = {
  BaseURL: string;
  pushSystem: (t: string) => void;
  pushUser: (t: string) => void;
  setIsLoading: (v: boolean) => void;
  setLastSearchQuery: (v: string) => void;
};

function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function extractFlipkartProducts(data: any): any[] {
  return data?.data?.products || data?.products || data?.results || [];
}

function detectClothingSearch(query: string) {
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

  const q = (query || "").toLowerCase();
  return clothingKeywords.some((k) => q.includes(k));
}

export default function useCombinedSearchFlow({
  BaseURL,
  pushSystem,
  pushUser,
  setIsLoading,
  setLastSearchQuery,
}: Opts) {
  // Reuse existing checkout flows (popups + state machine)
  const flipkartFlow = useFlipkartFlow({
    BaseURL,
    pushSystem,
    pushUser,
    setIsLoading,
    setLastSearchQuery,
  });

  const amazonFlow = useAmazonFlow({
    BaseURL,
    pushSystem,
    pushUser,
    setIsLoading,
    setLastSearchQuery,
  });

  const handleSearch = useCallback(
    async (query: string) => {
      setLastSearchQuery(query);

      if (!query?.trim()) {
        pushSystem("Please enter a product to search!");
        return;
      }

      setIsLoading(true);
      pushUser(query);

      console.log("COMBINED BaseURL =", BaseURL);

      try {
        console.log("COMBINED: starting parallel searches");

        const flipPromise = flipkartSearch(BaseURL, { query });
        console.log("COMBINED: flipkartSearch called");

        const amzPromise = amazonSearch(BaseURL, { query });
        console.log(
          "COMBINED: amazonSearch called (should log inside amazonApi.ts)"
        );

        const [flipRes, amzRes] = await Promise.allSettled([
          flipPromise,
          amzPromise,
        ]);

        console.log("COMBINED: searches settled", { flipRes, amzRes });

        let flipkartProducts: any[] = [];
        let amazonProducts: any[] = [];

        if (flipRes.status === "fulfilled") {
          const { res, data } = flipRes.value as any;
          if (res?.ok) flipkartProducts = extractFlipkartProducts(data);
          else
            pushSystem(
              data?.detail || data?.message || "Flipkart search failed."
            );
        } else {
          pushSystem("Flipkart search failed (exception).");
        }

        // Amazon result
        if (amzRes.status === "fulfilled") {
          const { res, data } = amzRes.value as any;

          if (res?.ok) {
            amazonProducts = (data?.results || []) as AmazonSearchResultItem[];

            const sid = data?.session_id;
            if (sid) amazonFlow.setSessionFromOutside(sid); // <-- IMPORTANT
          } else {
            pushSystem(
              data?.detail || data?.message || "Amazon search failed."
            );
          }
          console.log("Combined Amazon session_id:", data?.session_id);
        } else {
          pushSystem("Amazon search failed.");
        }
        console.log("AmazonFlow sessionId after set:", amazonFlow.sessionId);

        pushSystem(
          safeStringify({
            type: "combinedproductlist",
            flipkart: {
              products: flipkartProducts,
              isClothing: detectClothingSearch(query),
            },
            amazon: { products: amazonProducts },
          })
        );
      } catch (e) {
        console.error("COMBINED: handleSearch crashed", e);
        pushSystem("Combined search crashed. Check console.");
      } finally {
        setIsLoading(false);
      }
    },
    [BaseURL, pushSystem, pushUser, setIsLoading, setLastSearchQuery]
  );

  // Start checkout flows from the correct entry points.
  const onFlipkartSelect = useCallback(
    async (p: FlipkartProduct | any) => {
      await flipkartFlow.handleProductSelect(p);
    },
    [flipkartFlow]
  );

  const onAmazonSelect = useCallback(
    async (p: AmazonSearchResultItem) => {
      await amazonFlow.handleOpenDetails(p);
    },
    [amazonFlow]
  );

  const resetAllPopups = useCallback(() => {
    // Amazon already exposes a reset helper
    amazonFlow.resetCheckoutPopups?.();

    // Flipkart doesn't have a dedicated reset in your current code,
    // so close what we can safely close via exposed setters.
    flipkartFlow.setShowPhonePopup(false);
    flipkartFlow.setShowOtpPopup(false);
    flipkartFlow.setShowSizePopup(false);
    flipkartFlow.setShowAddressPopup(false);
    flipkartFlow.setShowUpiPopup(false);

    // Also close Amazon popups explicitly just in case
    amazonFlow.setShowProductDetails(false);
    amazonFlow.setShowSizePopup(false);
    amazonFlow.setShowPhonePopup(false);
    amazonFlow.setShowOtpPopup(false);
    amazonFlow.setShowAddressPopup(false);
    amazonFlow.setShowSelectAddressPopup(false);
    amazonFlow.setShowUpiPopup(false);
  }, [amazonFlow, flipkartFlow]);

  return {
    handleSearch,
    onFlipkartSelect,
    onAmazonSelect,
    resetAllPopups,
    flipkartFlow,
    amazonFlow,
  };
}
