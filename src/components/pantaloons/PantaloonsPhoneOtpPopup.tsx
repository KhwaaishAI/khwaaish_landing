import React from "react";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  onCheckSession: () => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onClose: () => void;
  loadingCheck: boolean;
  loadingSend: boolean;
  loadingVerify: boolean;
  phase: "CHECK" | "OTP";
};

export default function PantaloonsPhoneOtpPopup({
  open,
  phone,
  setPhone,
  otp,
  setOtp,
  onCheckSession,
  onSendOtp,
  onVerifyOtp,
  onClose,
  loadingCheck,
  loadingSend,
  loadingVerify,
  phase,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Phone Verification</h2>

        <input
          type="tel"
          placeholder="10-digit phone number"
          value={phone}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
            console.log("PANTALOONS PHONE changed:", v);
            setPhone(v);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        {phase === "OTP" ? (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              console.log("PANTALOONS OTP changed:", v);
              setOtp(v);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
        ) : null}

        <div className="space-y-2">
          {phase === "CHECK" ? (
            <button
              onClick={onCheckSession}
              disabled={loadingCheck}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingCheck ? <PopupLoader /> : null}
              Check session
            </button>
          ) : (
            <>
              <button
                onClick={onSendOtp}
                disabled={loadingSend}
                className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingSend ? <PopupLoader /> : null}
                Send OTP
              </button>

              <button
                onClick={onVerifyOtp}
                disabled={loadingVerify}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingVerify ? <PopupLoader /> : null}
                Verify & continue
              </button>
            </>
          )}

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
