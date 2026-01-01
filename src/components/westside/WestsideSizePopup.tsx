import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  productName?: string;
  productPrice?: string;
  sizes: string[];
  selectedSize: string;
  onSelectSize: (s: string) => void;
  onAddToCart: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function WestsideSizePopup({
  open,
  productName,
  productPrice,
  sizes,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onClose,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Select Size</h2>

        <div className="bg-gray-800 p-3 rounded-lg">
          {productName ? (
            <p className="text-sm text-gray-300">{productName}</p>
          ) : null}
          {productPrice ? (
            <p className="text-green-400 font-semibold mt-1">{productPrice}</p>
          ) : null}
        </div>

        {sizes.length > 0 ? (
          <div className="w-full flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  console.log("WESTSIDE SIZE selected", size);
                  onSelectSize(size);
                }}
                className={[
                  "h-11 w-14 px-2 rounded-lg border-2 transition-all inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                  selectedSize === size
                    ? "border-red-500 bg-red-500/20 text-white"
                    : "border-gray-600 bg-gray-800 text-gray-200 hover:border-gray-500",
                ].join(" ")}
                title={size}
              >
                {size}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-300">
            No sizes available for this product.
          </p>
        )}

        <div className="space-y-2">
          <button
            onClick={onAddToCart}
            disabled={loading || !selectedSize || sizes.length === 0}
            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Add to Cart
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
