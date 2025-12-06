interface AuthToastProps {
  message: string;
}

export default function AuthToast({ message }: AuthToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-8 z-[120]">
      <div className="rounded-full bg-black/80 text-white text-xs px-4 py-2 shadow-lg border border-white/20">
        {message}
      </div>
    </div>
  );
}
