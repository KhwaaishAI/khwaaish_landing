import type { TataCliqProduct } from "../../types/tatacliq";

type Props = {
  products: TataCliqProduct[];
  selectedProductUrl?: string | null;
  onSelect: (p: TataCliqProduct) => void;
};

export default function TataCliqProductGrid({
  products,
  selectedProductUrl,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">TataCliq products</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {products.slice(0, 12).map((p, index) => {
          const key = `${p.url}-${index}`;
          const isSelected = selectedProductUrl === p.url;

          return (
            <div
              key={key}
              onClick={() => {
                console.log("TATACLIQ UI product clicked:", p);
                onSelect(p);
              }}
              className={[
                "relative flex flex-col rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-colors",
                isSelected ? "bg-[#1e1416] hover:bg-[#151622]" : "bg-[#11121a]",
              ].join(" ")}
            >
              <div className="relative w-full bg-gray-800">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      console.log("TATACLIQ UI image failed:", p.image_url);
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col px-3 py-3 gap-2">
                <div className="min-h-[52px] space-y-1">
                  <p className="text-[11px] text-gray-300 line-clamp-2">
                    {p.brand || "-"}
                  </p>
                  <p className="text-xs text-gray-200 line-clamp-2">
                    {p.title}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-base font-bold text-white">
                    {p.price || "-"}
                  </p>
                </div>

                <div className="mt-2 flex justify-center">
                  <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">
                    Show details
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
