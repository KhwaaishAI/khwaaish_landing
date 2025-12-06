export default function HomeSidebar() {
  return (
    <aside className="h-full w-64 bg-black border-r border-black/60 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <img
              src="/images/LOGO.png"
              alt="Khwaaish AI"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs tracking-[0.2em] uppercase text-white/60">
              AI
            </span>
          </div>
        </div>

        <nav className="mt-8 space-y-2 px-4 text-sm text-white/80">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 bg-white/10 text-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16" />
              <path d="M8 5v14" />
            </svg>
            <span>New Chat</span>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8v4l2 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span>History</span>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 6h12v12H6z" />
              <path d="M9 10h6" />
              <path d="M9 14h3" />
            </svg>
            <span>Wallet</span>
          </button>
        </nav>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-white/40">
            <img
              src="/images/avatar.png"
              alt="Emma Stone"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight text-white/80">
            <div className="text-xs font-medium">Emma Stone</div>
            <div className="text-[10px] text-white/50">Personal</div>
          </div>
        </div>
        <button className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/90 border border-white/30">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
