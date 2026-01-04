import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  phone: string;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  onVerify: () => void;
  onCancel: () => void;
  loading: boolean;
};

export default function AmazonOtpPopup({
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
        <h2 className="text-xl font-semibold text-white">OTP Verification</h2>
        <p className="text-sm text-gray-400">
          OTP sent to {phone || "your phone"}.
        </p>

        <input
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
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
            onClick={onVerify}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
