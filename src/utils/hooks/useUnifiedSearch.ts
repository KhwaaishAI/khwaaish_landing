import { useCallback, useState } from "react";

import type { NykaaProduct } from "../../types/nykaa";
import type { WestsideProduct } from "../../types/westside";
import type { PantaloonsProduct } from "../../types/pantaloons";
import type { ShoppersStopProduct } from "../../types/shoppersstop";

import { nykaaSearch } from "../api/nykaaApi";
import { westsideSearch } from "../api/westsideApi";
import { pantaloonsSearch } from "../api/pantaloonsApi";
import { shoppersstopSearch } from "../api/shoppersstopApi";

type UnifiedSearchResult = {
  nykaa: NykaaProduct[];
  westside: WestsideProduct[];
  pantaloons: PantaloonsProduct[];
  shoppersstop: ShoppersStopProduct[];
};

// keep same shape intention as before (partial error map)
type UnifiedSearchErrors = Partial<{
  nykaa: string;
  westside: string;
  pantaloons: string;
  shoppersstop: string;
}>;

type Opts = {
  BaseURL: string;
};

function safeMsg(...vals: any[]) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

export function useUnifiedSearch({ BaseURL }: Opts) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<UnifiedSearchErrors>({});

  // Keep the same Pantaloons mapping logic as Pantaloons.tsx (do not change types)
  const mapPantaloonsToUIProducts = (data: any): PantaloonsProduct[] => {
    const rawProducts = Array.isArray(data?.products) ? data.products : [];
    const filtered = rawProducts
      .filter((p: any) => p?.product_url != null && p?.image != null)
      .slice(0, 5);

    return filtered.map((p: any) => ({
      productname: p?.name ?? p?.productname ?? "Unnamed product",
      producturl: p?.product_url ?? p?.producturl,
      imageurl: p?.image ?? p?.imageurl,
      // Prefer API's formatted display string if available, else fallback
      price: p?.price_text ?? p?.mrp ?? p?.price ?? "",
    })) as PantaloonsProduct[];
  };

  // existing behavior (kept as-is) - returns only when all finish
  const searchAll = useCallback(
    async (query: string): Promise<UnifiedSearchResult> => {
      const q = query?.trim();
      if (!q) {
        setErrors({
          nykaa: "Please enter a product to search!",
          westside: "Please enter a product to search!",
          pantaloons: "Please enter a product to search!",
          shoppersstop: "Please enter a product to search!",
        });
        return { nykaa: [], westside: [], pantaloons: [], shoppersstop: [] };
      }

      setLoading(true);
      setErrors({});

      try {
        const nykaaPromise = nykaaSearch(BaseURL, q);
        const westsidePromise = westsideSearch(BaseURL, q);
        const pantaloonsPromise = pantaloonsSearch(BaseURL, {
          query: q,
          page: 1,
          sort_by: "popularity",
        });
        const shoppersstopPromise = shoppersstopSearch(BaseURL, q);

        const [nykaaRes, westsideRes, pantaloonsRes, shoppersstopRes] =
          await Promise.allSettled([
            nykaaPromise,
            westsidePromise,
            pantaloonsPromise,
            shoppersstopPromise,
          ]);

        let nykaa: NykaaProduct[] = [];
        let westside: WestsideProduct[] = [];
        let pantaloons: PantaloonsProduct[] = [];
        let shoppersstop: ShoppersStopProduct[] = [];

        const nextErrors: UnifiedSearchErrors = {};

        // Nykaa
        if (nykaaRes.status === "fulfilled") {
          const { res, data } = nykaaRes.value as any;
          if (res?.ok) {
            nykaa = (data?.products ?? data?.results ?? []).map((p: any) => ({
              ...p,
              // normalize snake_case -> the existing NykaaProduct key
              availablesizes:
                p?.availablesizes ??
                p?.available_sizes ??
                p?.availableSizes ??
                [],
              // optional: normalize image key too if needed
              imageurl: p?.imageurl ?? p?.image_url ?? p?.image ?? p?.imageUrl,
            })) as NykaaProduct[];
          } else {
            nextErrors.nykaa = safeMsg(
              data?.message,
              data?.detail,
              "Nykaa search failed."
            );
          }
        } else {
          nextErrors.nykaa = "Nykaa search failed.";
        }

        // Westside
        if (westsideRes.status === "fulfilled") {
          const { res, data } = westsideRes.value as any;
          if (res?.ok) {
            westside = (data?.products ?? []) as WestsideProduct[];
          } else {
            nextErrors.westside = safeMsg(
              data?.message,
              data?.detail,
              "Westside search failed."
            );
          }
        } else {
          nextErrors.westside = "Westside search failed.";
        }

        // Pantaloons
        if (pantaloonsRes.status === "fulfilled") {
          const { res, data } = pantaloonsRes.value as any;
          if (res?.ok) {
            pantaloons = mapPantaloonsToUIProducts(data);
          } else {
            nextErrors.pantaloons = safeMsg(
              data?.message,
              data?.detail,
              "Pantaloons search failed."
            );
          }
        } else {
          nextErrors.pantaloons = "Pantaloons search failed.";
        }

        // Shoppers Stop (preserve original keys/behavior)
        if (shoppersstopRes.status === "fulfilled") {
          const { res, data } = shoppersstopRes.value as any;
          if (!res?.ok || String(data?.status).toLowerCase() !== "success") {
            nextErrors.shoppersstop = safeMsg(
              data?.message,
              data?.detail,
              "Shoppers Stop search failed."
            );
          } else {
            shoppersstop = Array.isArray(data?.products)
              ? (data.products as ShoppersStopProduct[])
              : [];
          }
        } else {
          nextErrors.shoppersstop = "Shoppers Stop search failed.";
        }

        setErrors(nextErrors);
        return { nykaa, westside, pantaloons, shoppersstop };
      } finally {
        setLoading(false);
      }
    },
    [BaseURL]
  );

  /**
   * NEW: streaming version.
   * Calls onUpdate multiple times (as each brand finishes) while other calls continue.
   * Does NOT change existing keys/props/types used in Unified.tsx.
   */
  const searchAllStreaming = useCallback(
    (
      query: string,
      onUpdate: (patch: Partial<UnifiedSearchResult>) => void
    ) => {
      const q = query?.trim();

      if (!q) {
        setErrors({
          nykaa: "Please enter a product to search!",
          westside: "Please enter a product to search!",
          pantaloons: "Please enter a product to search!",
          shoppersstop: "Please enter a product to search!",
        });
        onUpdate({
          nykaa: [],
          westside: [],
          pantaloons: [],
          shoppersstop: [],
        });
        return Promise.resolve({
          nykaa: [],
          westside: [],
          pantaloons: [],
          shoppersstop: [],
        });
      }

      setLoading(true);
      setErrors({});

      const nextErrors: UnifiedSearchErrors = {};

      // Start all searches in parallel (do not await here)
      const nykaaPromise = nykaaSearch(BaseURL, q)
        .then(({ res, data }: any) => {
          if (res?.ok) {
            const nykaa = (data?.products ?? data?.results ?? []).map(
              (p: any) => ({
                ...p,
                availablesizes:
                  p?.availablesizes ??
                  p?.available_sizes ??
                  p?.availableSizes ??
                  [],
                imageurl:
                  p?.imageurl ?? p?.image_url ?? p?.image ?? p?.imageUrl,
              })
            ) as NykaaProduct[];

            onUpdate({ nykaa });
          } else {
            nextErrors.nykaa = safeMsg(
              data?.message,
              data?.detail,
              "Nykaa search failed."
            );
            setErrors({ ...nextErrors });
            onUpdate({ nykaa: [] });
          }
        })
        .catch(() => {
          nextErrors.nykaa = "Nykaa search failed.";
          setErrors({ ...nextErrors });
          onUpdate({ nykaa: [] });
        });

      const westsidePromise = westsideSearch(BaseURL, q)
        .then(({ res, data }: any) => {
          if (res?.ok) {
            const westside = (data?.products ?? []) as WestsideProduct[];
            onUpdate({ westside });
          } else {
            nextErrors.westside = safeMsg(
              data?.message,
              data?.detail,
              "Westside search failed."
            );
            setErrors({ ...nextErrors });
            onUpdate({ westside: [] });
          }
        })
        .catch(() => {
          nextErrors.westside = "Westside search failed.";
          setErrors({ ...nextErrors });
          onUpdate({ westside: [] });
        });

      const pantaloonsPromise = pantaloonsSearch(BaseURL, {
        query: q,
        page: 1,
        sort_by: "popularity",
      })
        .then(({ res, data }: any) => {
          if (res?.ok) {
            const pantaloons = mapPantaloonsToUIProducts(data);
            onUpdate({ pantaloons });
          } else {
            nextErrors.pantaloons = safeMsg(
              data?.message,
              data?.detail,
              "Pantaloons search failed."
            );
            setErrors({ ...nextErrors });
            onUpdate({ pantaloons: [] });
          }
        })
        .catch(() => {
          nextErrors.pantaloons = "Pantaloons search failed.";
          setErrors({ ...nextErrors });
          onUpdate({ pantaloons: [] });
        });

      const shoppersstopPromise = shoppersstopSearch(BaseURL, q)
        .then(({ res, data }: any) => {
          if (!res?.ok || String(data?.status).toLowerCase() !== "success") {
            nextErrors.shoppersstop = safeMsg(
              data?.message,
              data?.detail,
              "Shoppers Stop search failed."
            );
            setErrors({ ...nextErrors });
            onUpdate({ shoppersstop: [] });
          } else {
            const shoppersstop = Array.isArray(data?.products)
              ? (data.products as ShoppersStopProduct[])
              : [];
            onUpdate({ shoppersstop });
          }
        })
        .catch(() => {
          nextErrors.shoppersstop = "Shoppers Stop search failed.";
          setErrors({ ...nextErrors });
          onUpdate({ shoppersstop: [] });
        });

      // Return a promise that settles when all are done (useful for finally blocks)
      return Promise.allSettled([
        nykaaPromise,
        westsidePromise,
        pantaloonsPromise,
        shoppersstopPromise,
      ]).then(() => {
        setErrors({ ...nextErrors });
        setLoading(false);

        // final combined is not strictly required by your UI,
        // but return it anyway (empty arrays if failed)
        return {
          nykaa: [],
          westside: [],
          pantaloons: [],
          shoppersstop: [],
        } as UnifiedSearchResult;
      });
    },
    [BaseURL]
  );

  return { searchAll, searchAllStreaming, loading, errors };
}
