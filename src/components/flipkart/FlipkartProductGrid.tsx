import React from "react";
import type { FlipkartProduct } from "../../types/flipkart";

type Props = {
  products: any[];
  pendingProduct: FlipkartProduct | null;
  lastSearchQuery: string;
  onSelect: (p: any) => void;
};

export default function FlipkartProductGrid({
  products,
  pendingProduct,
  lastSearchQuery,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">
        Here are some products from Flipkart:
      </h3>

      <div className="max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {products?.slice(0, 5).map((p: any, index: number) => {
            const key = p.product_url + index;
            const isSelected =
              pendingProduct && pendingProduct.product_url === p.product_url;

            return (
              <div
                key={key}
                onClick={() => onSelect(p)}
                className={`relative flex flex-col bg-[#11121a] rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-colors ${
                  isSelected ? "bg-[#1e1416]" : "hover:bg-[#151622]"
                }`}
              >
                {p.image && (
                  <div className="relative w-full h-52 bg-gray-800">
                    <img
                      src={p.image}
                      alt={p.title || "Product image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {p.rating && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                        <span className="text-yellow-300">⭐</span>
                        <span className="text-white font-medium">
                          {p.rating}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                  <div className="min-h- space-y-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {p.title || lastSearchQuery || "Flipkart Product"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-2">
                      {p.price && (
                        <p className="text-base font-bold text-white">
                          {p.price}
                        </p>
                      )}
                      {p.original_price && p.original_price !== p.price && (
                        <p className="text-xs text-gray-400 line-through">
                          {p.original_price}
                        </p>
                      )}
                    </div>
                    {p.discount && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-500/40">
                        {p.discount}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">
                      Select Product
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
