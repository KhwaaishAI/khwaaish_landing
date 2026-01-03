import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  mobile: string;
  setMobile: (v: string) => void;
  otp: string;
  setOtp: (v: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onClose: () => void;
  loadingSend: boolean;
  loadingVerify: boolean;
};

export default function WestsideLoginOtpPopup({
  open,
  mobile,
  setMobile,
  otp,
  setOtp,
  onSendOtp,
  onVerifyOtp,
  onClose,
  loadingSend,
  loadingVerify,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Login</h2>

        <input
          type="tel"
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
            console.log("WESTSIDE LOGIN mobile changed", v);
            setMobile(v);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <button
          onClick={onSendOtp}
          disabled={loadingSend}
          className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingSend ? <PopupLoader /> : null}
          Send OTP
        </button>

        <div className="border-t border-gray-700 pt-4 space-y-2">
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              console.log("WESTSIDE OTP changed", v);
              setOtp(v);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <button
            onClick={onVerifyOtp}
            disabled={loadingVerify}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingVerify ? <PopupLoader /> : null}
            Verify OTP
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
