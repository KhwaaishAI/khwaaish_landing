import { useCallback, useState } from "react";

import type { NykaaProduct } from "../../types/nykaa";
import type { WestsideProduct } from "../../types/westside";
import type { PantaloonsProduct } from "../../types/pantaloons";

import { nykaaSearch } from "../api/nykaaApi";
import { westsideSearch } from "../api/westsideApi";
import { pantaloonsSearch } from "../api/pantaloonsApi";

type UnifiedSearchResult = {
  nykaa: NykaaProduct[];
  westside: WestsideProduct[];
  pantaloons: PantaloonsProduct[];
};

type UnifiedSearchErrors = Partial<Record<keyof UnifiedSearchResult, string>>;

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

  const searchAll = useCallback(
    async (query: string): Promise<UnifiedSearchResult> => {
      const q = query?.trim();
      if (!q) {
        setErrors({
          nykaa: "Please enter a product to search!",
          westside: "Please enter a product to search!",
          pantaloons: "Please enter a product to search!",
        });
        return { nykaa: [], westside: [], pantaloons: [] };
      }

      setLoading(true);
      setErrors({});

      try {
        // Start all three searches in parallel (same pattern as useCombinedSearchFlow)
        const nykaaPromise = nykaaSearch(BaseURL, q);
        const westsidePromise = westsideSearch(BaseURL, q);
        const pantaloonsPromise = pantaloonsSearch(BaseURL, {
          query: q,
          page: 1,
          sort_by: "popularity",
        });

        const [nykaaRes, westsideRes, pantaloonsRes] = await Promise.allSettled(
          [nykaaPromise, westsidePromise, pantaloonsPromise]
        );

        let nykaa: NykaaProduct[] = [];
        let westside: WestsideProduct[] = [];
        let pantaloons: PantaloonsProduct[] = [];

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

        setErrors(nextErrors);

        return { nykaa, westside, pantaloons };
      } finally {
        setLoading(false);
      }
    },
    [BaseURL]
  );

  return { searchAll, loading, errors };
}
