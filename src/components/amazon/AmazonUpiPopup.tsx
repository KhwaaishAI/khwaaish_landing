import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  upiId: string;
  setUpiId: React.Dispatch<React.SetStateAction<string>>;
  onPay: () => void;
  onCancel: () => void;
  loading: boolean;
  amountLabel?: string;
};

export default function AmazonUpiPopup({
  open,
  upiId,
  setUpiId,
  onPay,
  onCancel,
  loading,
  amountLabel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Pay with UPI</h2>
        <p className="text-sm text-gray-400">
          Enter your UPI ID {amountLabel ? `to pay ${amountLabel}` : ""}.
        </p>

        <input
          type="text"
          placeholder="upi@bank"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onPay}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Pay
          </button>
        </div>
      </div>
    </div>
  );
}
