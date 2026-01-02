import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  onVerify: () => void;
  loadingOtp: boolean;
};

export default function OtpPopup({
  open,
  phone,
  otp,
  setOtp,
  onVerify,
  loadingOtp,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
        <p className="text-sm text-gray-400">Enter OTP sent to {phone}</p>

        <input
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <button
          onClick={onVerify}
          disabled={loadingOtp}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingOtp ? <PopupLoader /> : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
