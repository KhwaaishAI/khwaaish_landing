interface AuthDobPopupProps {
  onClose: () => void;
}

export default function AuthDobPopup({ onClose }: AuthDobPopupProps) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <div
        className="relative bg-black/95 border border-white/20 shadow-2xl text-white font-[Poppins]"
        style={{ width: 512, height: 816, borderRadius: 10 }}
      >
        <div className="px-10 pt-8 pb-6">
          <div className="text-center mb-4 space-y-1">
            <img
              src="/images/LOGO.png"
              alt="Khwaaish"
              className="h-8 mx-auto object-contain"
            />
            <h2 className="text-base font-semibold">Complete Your Profile</h2>
            <p className="text-[11px] text-white/60">
              Perfect Ready to continue
            </p>
          </div>

          <div className="space-y-3 text-[11px]">
            <div>
              <label className="block mb-1 text-white/70">Full Name</label>
              <input
                className="w-full rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm outline-none placeholder-white/40"
                placeholder="Rahul Patel"
              />
            </div>

            <div>
              <label className="block mb-1 text-white/70">Date of Birth</label>
              <div
                className="mt-1 rounded-xl bg-black border border-white/20 text-white"
                style={{ width: 332, height: 450, borderRadius: 12, paddingTop: 24, paddingRight: 24, paddingLeft: 24 }}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <button className="text-white/60">{"<"}</button>
                  <span>March 2004</span>
                  <button className="text-white/60">{">"}</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] text-white/50 mb-1">
                  {['S','M','T','W','T','F','S'].map((d) => (
                    <span key={d} className="text-center">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs mt-1">
                  {days.map((d) => (
                    <button
                      key={d}
                      className={`h-7 w-7 rounded-full text-center ${
                        d === 13 ? 'bg-red-600 text-white' : 'bg-transparent text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
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

            <button
              onClick={onClose}
              className="mt-6 w-full h-10 rounded-full bg-red-600 text-xs font-medium hover:bg-red-500"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
