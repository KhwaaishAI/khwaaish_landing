interface HomeTopBarProps {
  onLoginClick: () => void;
}

export default function HomeTopBar({ onLoginClick }: HomeTopBarProps) {
  return (
    <div className="flex items-center justify-end px-10 pt-6 gap-5">
      <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/10 text-white/80">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 17h5l-1.5-1.5A2 2 0 0118 14v-3a6 6 0 00-12 0v3a2 2 0 01-.5 1.5L4 17h5" />
          <path d="M10 21h4" />
        </svg>
      </button>
      <button
        className="px-4 py-1.5 rounded-full border border-white/70 bg-black/20 text-sm text-white/90"
        onClick={onLoginClick}
      >
        Login
      </button>
    </div>
  );
}
