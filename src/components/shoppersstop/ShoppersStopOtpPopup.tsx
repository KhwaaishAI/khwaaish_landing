import PopupLoader from "../PopupLoader";
import type { ShoppersStopBill } from "../../types/shoppersstop";

type Props = {
  open: boolean;
  otp: string;
  setOtp: (v: string) => void;

  bill?: ShoppersStopBill | null;

  onVerifyOtp: () => void;

  onCancelBack: () => void; // back to product popup
  loadingVerify: boolean;
};

export default function ShoppersStopOtpPopup({
  open,
  otp,
  setOtp,
  bill,
  onVerifyOtp,
  onCancelBack,
  loadingVerify,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Verify OTP</h2>

        {bill ? (
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-300">Bill</p>
            <p className="text-sm text-white mt-1">
              Payable: {bill.total_payable}
            </p>
          </div>
        ) : null}

        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            console.log("SHOPPERSSTOP OTP changed:", v);
            setOtp(v);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <div className="space-y-2">
          <button
            onClick={onVerifyOtp}
            disabled={loadingVerify || !otp.trim()}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingVerify ? <PopupLoader /> : null}
            Verify OTP
          </button>

          <button
            onClick={onCancelBack}
            disabled={loadingVerify}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
