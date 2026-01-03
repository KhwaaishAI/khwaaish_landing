import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  pincode: string;
  setPincode: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function PantaloonsPincodePopup({
  open,
  pincode,
  setPincode,
  onSubmit,
  onClose,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Enter Pincode</h2>

        <input
          type="text"
          placeholder="6-digit pincode"
          value={pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            console.log("PANTALOONS PINCODE changed:", v);
            setPincode(v);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <div className="space-y-2">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
