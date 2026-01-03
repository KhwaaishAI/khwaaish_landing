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

  // During loading (either view loading or add-to-cart loading),
  // block closing/selecting to avoid weird state jumps.
  const disableAll = loading;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        {/* Popup loader overlay until size popup is "ready" */}
        {/* {loading ? (
          // <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center z-10">
          //   <div className="flex flex-col items-center gap-2">
          //     <PopupLoader />
          //     <p className="text-xs text-gray-200">Loading sizes...</p>
          //   </div>
          // </div>
        ) : null} */}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Select Size</h2>
          {/* Optional small inline loader space (keeps layout stable) */}
          <div className="h-5 w-5">{/* overlay already covers */}</div>
        </div>

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
                disabled={disableAll}
                onClick={() => {
                  console.log("WESTSIDE SIZE selected", size);
                  onSelectSize(size);
                }}
                className={[
                  "h-11 w-18 px-2 rounded-lg border-2 transition-all inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
                  disableAll ? "opacity-50 cursor-not-allowed" : "",
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
            onClick={() => {
              if (!disableAll) onClose();
            }}
            disabled={disableAll}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
