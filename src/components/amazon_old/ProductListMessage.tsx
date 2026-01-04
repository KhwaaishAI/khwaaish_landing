import type { Product } from "../../types/amazon_old";

type Props = {
  products: any[];
  pendingProduct: Product | null;
  lastSearchQuery: string;
  onSelect: (p: Product) => void;
};

export default function ProductListMessage({
  products,
  pendingProduct,
  lastSearchQuery,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">
        Here are some products from Amazon:
      </h3>

      <div className="max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {products?.slice(0, 18).map((p: any, index: number) => {
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
                {p.image_url && (
                  <div className="relative w-full h-52 bg-gray-800">
                    <img
                      src={p.image_url}
                      alt={p.name || "Product image"}
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
                  <div className="min-h-[60px] space-y-1">
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {p.name || lastSearchQuery || "Amazon Product"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-2">
                      {p.price && (
                        <p className="text-base font-bold text-white">
                          {p.price}
                        </p>
                      )}
                    </div>
                    {p.reviews_count && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/40">
                        {p.reviews_count}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">
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
