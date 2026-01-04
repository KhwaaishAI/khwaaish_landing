import React from "react";
import type { PantaloonsProduct } from "../../types/pantaloons";

type Props = {
  products: PantaloonsProduct[];
  selectedProductUrl: string | null;
  onSelect: (p: PantaloonsProduct) => void;
};

export default function PantaloonsProductGrid({
  products,
  selectedProductUrl,
  onSelect,
}: Props) {
  if (!products?.length) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p) => (
          <button
            key={p.producturl}
            onClick={() => {
              console.log("PANTALOONS UI product clicked:", p);
              onSelect(p);
            }}
            className={[
              "text-left rounded-xl border p-3 bg-white/5 hover:bg-white/10 transition",
              selectedProductUrl === p.producturl
                ? "border-yellow-400"
                : "border-gray-800",
            ].join(" ")}
          >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-black/30 border border-gray-800">
              {p.imageurl ? (
                <img
                  src={p.imageurl}
                  alt={p.productname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                  No image
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="text-sm text-white line-clamp-2">{p.productname}</p>
              {p.price ? (
                <p className="text-xs text-white/70 mt-1">{p.price}</p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
