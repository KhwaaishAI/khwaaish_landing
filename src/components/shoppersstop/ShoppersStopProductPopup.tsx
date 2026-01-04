import PopupLoader from "../PopupLoader";
import type { ShoppersStopBill } from "../../types/shoppersstop";

type Props = {
  open: boolean;

  loading: boolean;
  loadingAddToCart: boolean;

  productTitle?: string;
  productPrice?: string;

  sizes: string[];
  selectedSize: string;
  onSelectSize: (s: string) => void;

  phone: string;
  setPhone: (v: string) => void;

  bill?: ShoppersStopBill | null;

  onAddToCart: () => void;

  onClose: () => void; // cancel to close
};

export default function ShoppersStopProductPopup({
  open,
  loading,
  loadingAddToCart,
  productTitle,
  productPrice,
  sizes,
  selectedSize,
  onSelectSize,
  phone,
  setPhone,
  bill,
  onAddToCart,
  onClose,
}: Props) {
  if (!open) return null;

  const disableAll = loading || loadingAddToCart;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        {disableAll ? (
          <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <PopupLoader />
              <p className="text-xs text-gray-200">
                {loading ? "Loading sizes..." : "Adding to bag..."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Product details</h2>
          <div className="h-5 w-5" />
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          {productTitle ? (
            <p className="text-sm text-gray-200">{productTitle}</p>
          ) : null}
          {productPrice ? (
            <p className="text-green-400 font-semibold mt-1">{productPrice}</p>
          ) : null}
        </div>

        {bill ? (
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-300">Current bill (if available)</p>
            <p className="text-sm text-white mt-1">
              Payable: {bill.total_payable}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-sm text-gray-200 mb-2">Select size</p>
          {sizes.length ? (
            <div className="w-full flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={disableAll}
                  onClick={() => {
                    console.log("SHOPPERSSTOP SIZE selected:", size);
                    onSelectSize(size);
                  }}
                  className={[
                    "h-11 min-w-[56px] px-2 rounded-lg border-2 transition-all inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
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
        </div>

        <div>
          <p className="text-sm text-gray-200 mb-2">Phone (for OTP)</p>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 10);
              console.log("SHOPPERSSTOP phone changed:", v);
              setPhone(v);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            disabled={disableAll}
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={onAddToCart}
            disabled={
              disableAll ||
              !selectedSize ||
              sizes.length === 0 ||
              phone.replace(/\D/g, "").length !== 10
            }
            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingAddToCart ? <PopupLoader /> : null}
            Add to cart
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
