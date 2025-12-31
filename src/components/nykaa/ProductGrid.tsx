import type { NykaaProduct } from "../../types/nykaa";

type Props = {
  products: NykaaProduct[];
  selectedProduct?: NykaaProduct | null;
  onSelect: (p: NykaaProduct) => void;
};

export default function ProductGrid({
  products,
  selectedProduct,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">
        Here are some fashion finds
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {products.slice(0, 18).map((p, index) => {
          const key = `${p.brand || "brand"}-${p.name}-${p.price || index}`;
          const isSelected =
            selectedProduct &&
            selectedProduct.name === p.name &&
            selectedProduct.brand === p.brand;

          const imgSrc = (p as any).image_url;

          const sizes = (p as any).available_sizes;

          return (
            <div
              key={key}
              onClick={() => onSelect(p)}
              className={`relative flex flex-col rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-colors ${
                isSelected ? "bg-[#1e1416] hover:bg-[#151622]" : "bg-[#11121a]"
              }`}
            >
              <div className="relative w-full h-36 bg-gray-800">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("NYKAA UI: image failed to load =", imgSrc);
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
                {p.rating ? (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-xs">
                    <span className="text-white font-medium">
                      {String(p.rating)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                <div className="min-h-[52px] space-y-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {p.brand}
                  </p>
                  <p className="text-xs text-gray-300 line-clamp-2">{p.name}</p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-baseline gap-2">
                    {p.price ? (
                      <p className="text-base font-bold text-white">
                        {p.price}
                      </p>
                    ) : null}
                    {p.originalprice && p.originalprice !== p.price ? (
                      <p className="text-xs text-gray-400 line-through">
                        {p.originalprice}
                      </p>
                    ) : null}
                  </div>

                  {p.discount ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-500/40">
                      {p.discount}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex justify-end">
                  <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">
                    Select Size
                  </button>
                </div>
              </div>

              {isSelected ? (
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
