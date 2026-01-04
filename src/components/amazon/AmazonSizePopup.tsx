import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  title?: string;
  sizes: string[];
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  onContinue: () => void;
  onCancel: () => void;
  loading: boolean;
};

export default function AmazonSizePopup({
  open,
  title,
  sizes,
  selectedSize,
  setSelectedSize,
  onContinue,
  onCancel,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-[92vw] max-w-md space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Select size</h2>
        <p className="text-sm text-gray-400 line-clamp-2">{title}</p>

        <div className="flex flex-wrap gap-2">
          {sizes?.map((s) => (
            <button
              key={s}
              onClick={() => {
                console.log("AMAZON UI: Size clicked:", s);
                setSelectedSize(s);
              }}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                selectedSize === s
                  ? "border-red-500 bg-red-500/10 text-white"
                  : "border-gray-700 bg-white/5 text-gray-200 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onContinue}
            disabled={loading || !selectedSize}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
