import React from "react";
import type { AmazonSearchResultItem } from "../../types/amazon";

type Props = {
  products: AmazonSearchResultItem[];
  onDetails: (p: AmazonSearchResultItem) => void;
};

export default function AmazonProductGrid({ products, onDetails }: Props) {
  if (!products?.length) {
    return (
      <div className="p-4 text-sm text-gray-300">
        No products found. Try a different query.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {products.slice(0, 5).map((p, idx) => (
        <div
          key={`${p.product_url}-${idx}`}
          className="text-left rounded-xl border border-gray-800 bg-white/5 hover:bg-white/10 transition p-3"
        >
          <div className="w-full aspect-square overflow-hidden rounded-lg bg-black/40 flex items-center justify-center">
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="mt-2 space-y-1">
            <div className="text-sm text-white line-clamp-2">{p.name}</div>
            <div className="text-sm font-semibold text-red-300">{p.price}</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                console.log("AMAZON UI: Product details button clicked", p);
                onDetails(p);
              }}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold"
            >
              Product details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
