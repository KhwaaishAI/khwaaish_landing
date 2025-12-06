interface AuthWelcomePopupProps {
  onContinuePhone: () => void;
  onContinueGoogle: () => void;
}

export default function AuthWelcomePopup({
  onContinuePhone,
  onContinueGoogle,
}: AuthWelcomePopupProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
      <div
        className="relative flex flex-col items-center justify-between bg-black/95 border border-white/20 shadow-2xl text-white px-10 pt-10 pb-8 font-[Poppins]"
        style={{
          width: 512,
          height: 517,
          borderRadius: 10,
        }}
      >
        <div className="text-center space-y-4 w-full">
          <img
            src="/images/LOGO.png"
            alt="Khwaaish"
            className="h-10 mx-auto object-contain"
          />
          <div>
            <h2 className="text-lg font-semibold mb-1">Welcome to Khwaaish GPT</h2>
            <p className="text-xs text-white/70">Sign in to continue</p>
          </div>
        </div>

        <div className="w-full space-y-4 mt-6">
          <button
            onClick={onContinuePhone}
            className="w-full h-11 rounded-full bg-white/5 border border-white/30 text-sm flex items-center justify-center gap-2 hover:bg-white/10"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[10px]">
              +
            </span>
            <span>Continue with Phone Number</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <div className="h-px flex-1 bg-white/20" />
            <span>or</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <button
            onClick={onContinueGoogle}
            className="w-full h-11 rounded-full bg-white text-black text-sm flex items-center justify-center gap-2 hover:bg-white/90"
          >
            <span className="h-4 w-4 rounded-full bg-red-500" />
            <span>Continue with Google</span>
          </button>

          <p className="mt-2 text-[10px] text-center text-red-400 leading-snug">
            By continuing, you agree to Khwaaish&apos;s
            <br />
            Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
