import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  phone: string;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  onVerify: () => void;
  onCancel: () => void; // ✅ NEW
  loading: boolean;
};

export default function FlipkartOtpPopup({
  open,
  phone,
  otp,
  setOtp,
  onVerify,
  onCancel,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
        <p className="text-sm text-gray-400">
          OTP sent to <span className="text-gray-200">{phone}</span>
        </p>

        <input
          type="tel"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white font-semibold border border-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onVerify}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
