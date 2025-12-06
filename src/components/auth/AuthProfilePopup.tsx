interface AuthProfilePopupProps {
  onBack: () => void;
  onOpenDob: () => void;
}

export default function AuthProfilePopup({ onBack, onOpenDob }: AuthProfilePopupProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
      <div
        className="relative bg-black/95 border border-white/20 shadow-2xl text-white px-10 pt-9 pb-8 font-[Poppins]"
        style={{ width: 512, height: 457, borderRadius: 10 }}
      >
        <button
          onClick={onBack}
          className="absolute left-6 top-6 text-xs text-white/60 hover:text-white"
        >
          {"< Back"}
        </button>

        <div className="text-center mt-4 mb-6 space-y-1">
          <img
            src="/images/LOGO.png"
            alt="Khwaaish"
            className="h-8 mx-auto object-contain"
          />
          <h2 className="text-base font-semibold">Complete Your Profile</h2>
          <p className="text-[11px] text-white/60">Perfect Ready to continue</p>
        </div>

        <div className="space-y-3 text-[11px]">
          <div>
            <label className="block mb-1 text-white/70">Full Name</label>
            <input
              className="w-full rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm outline-none placeholder-white/40"
              placeholder="Dityansh"
            />
          </div>

          <div>
            <label className="block mb-1 text-white/70">Date of Birth</label>
            <button
              onClick={onOpenDob}
              className="w-full flex items-center justify-between rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm hover:bg-white/10"
            >
              <span className="text-white/80">30 Nov 2005</span>
              <span className="h-4 w-4 rounded-full bg-white/40" />
            </button>
          </div>

          <div>
            <label className="block mb-1 text-white/70">Gender</label>
            <select className="w-full rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm outline-none">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Others</option>
            </select>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-[11px]">
            <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/25 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span>Male</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/25 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-white/30" />
              <span>Female</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/25 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-white/30" />
              <span>Others</span>
            </div>
          </div>

          <button className="mt-4 w-full h-10 rounded-full bg-red-600 text-xs font-medium hover:bg-red-500">
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
