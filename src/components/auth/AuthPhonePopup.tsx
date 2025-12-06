interface AuthPhonePopupProps {
  onBack: () => void;
  onNext: () => void;
}

export default function AuthPhonePopup({ onBack, onNext }: AuthPhonePopupProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
      <div
        className="relative bg-black/95 border border-white/20 shadow-2xl text-white px-10 pt-9 pb-8 font-[Poppins]"
        style={{ width: 512, height: 394, borderRadius: 10 }}
      >
        <button
          onClick={onBack}
          className="absolute left-6 top-6 text-xs text-white/60 hover:text-white"
        >
          &lt; Back
        </button>

        <div className="text-center mt-4 mb-6 space-y-1">
          <img
            src="/images/LOGO.png"
            alt="Khwaaish"
            className="h-8 mx-auto object-contain"
          />
          <h2 className="text-base font-semibold">Enter Phone Number</h2>
          <p className="text-[11px] text-white/60">
            We&apos;ll send you a verification code
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] text-white/70 mb-1">
            Phone Number
          </label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/25 rounded-md px-3 py-2 text-sm">
            <span className="text-white/80 text-xs">+91</span>
            <div className="h-4 w-px bg-white/20" />
            <input
              className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
              placeholder="234 8136 7834"
            />
          </div>

          <button
            onClick={onNext}
            className="mt-4 w-full h-10 rounded-full bg-red-600 text-xs font-medium hover:bg-red-500"
          >
            Send OTP
          </button>
        </div>
      </div>
    </div>
  );
}
