import { useState, useRef } from "react";

interface AuthOtpPopupProps {
  onBack: () => void;
  onNext: () => void;
}

export default function AuthOtpPopup({ onBack, onNext }: AuthOtpPopupProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
          <h2 className="text-base font-semibold">Enter Verification Code</h2>
          <p className="text-[11px] text-white/60">
            Code sent to +91 234 8136 7834
          </p>
          <button className="text-[11px] text-red-400 mt-1">
            Change Number
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 rounded-md bg-white/5 border border-white/30 text-center text-lg outline-none focus:border-white/60 transition-colors"
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="mt-2 w-full h-10 rounded-full bg-red-600 text-xs font-medium hover:bg-red-500"
          >
            Verify &amp; Continue
          </button>

          <p className="text-[11px] text-center text-white/50 mt-1">
            Didn&apos;t receive code? Resend
          </p>
        </div>
      </div>
    </div>
  );
}
