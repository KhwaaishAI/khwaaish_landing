import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  productName?: string;
  productPrice?: string;
  sizes: string[];
  selectedSize: string;
  onSelectSize: (s: string) => void;
  onContinue: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function PantaloonsSizePopup({
  open,
  productName,
  productPrice,
  sizes,
  selectedSize,
  onSelectSize,
  onContinue,
  onClose,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Select Size</h2>

        {productName ? (
          <p className="text-sm text-white/80">{productName}</p>
        ) : null}
        {productPrice ? (
          <p className="text-sm text-white/60">{productPrice}</p>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                console.log("PANTALOONS SIZE selected:", s);
                onSelectSize(s);
              }}
              className={[
                "py-2 rounded-lg border text-sm font-semibold",
                selectedSize === s
                  ? "bg-yellow-500 text-black border-yellow-400"
                  : "bg-white/10 text-white border-gray-700 hover:bg-white/15",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={onContinue}
            disabled={loading}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Continue
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
