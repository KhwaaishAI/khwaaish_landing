import { BsPencilSquare, BsWallet2 } from "react-icons/bs";
import { IoPerson } from "react-icons/io5";


interface HomeSidebarProps {
  userName?: string;
}

export default function HomeSidebar({ userName }: HomeSidebarProps) {
  return (
    <aside className="h-screen sticky top-0 w-64 bg-[#171717] border-r border-white/10 flex flex-col justify-between">
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
            <BsPencilSquare className="h-4 w-4" />
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
            <BsWallet2 className="h-4 w-4" />
            <span>Wallet</span>
          </button>
        </nav>
      </div>

      <div className="mx-4 mb-4 pt-4 border-t border-white/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-white/40">
            {/* <img
              src="/images/avatar.png"
              alt={userName || "User"}
              className="h-full w-full object-cover"
            /> */}
            <IoPerson className="h-full w-full" />
          </div>
          <div className="leading-tight text-white/80">
            <div className="text-xs font-medium">{userName || "Guest User"}</div>
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
