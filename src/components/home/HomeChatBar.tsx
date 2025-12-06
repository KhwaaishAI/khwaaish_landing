import { useEffect, useRef, useState } from "react";

interface HomeChatBarProps {
  placeholder?: string;
}

interface Brand {
  id: string;
  name: string;
  route: string;
  icon: string; // local or URL icon
}

// Add icons for visual match 🎨
const BRANDS: Brand[] = [
  {
    id: "instamart",
    name: "Instamart",
    route: "/instamart",
    icon: "/icons/instamart.png",
  },
  {
    id: "jiomart",
    name: "JioMart",
    route: "/jiomart",
    icon: "/icons/jiomart.png",
  },
  {
    id: "booking",
    name: "Booking.com",
    route: "/booking",
    icon: "/icons/booking.png",
  },
  {
    id: "tatacliq",
    name: "TataCliq",
    route: "/tatacliq",
    icon: "/icons/tatacliq.png",
  },
  { id: "zepto", name: "Zepto", route: "/zepto", icon: "/icons/zepto.png" },
  { id: "myntra", name: "Myntra", route: "/myntra", icon: "/icons/myntra.png" },
  { id: "oyo", name: "OYO", route: "/oyo", icon: "/icons/oyo.png" },
  { id: "dmart", name: "D Mart", route: "/dmart", icon: "/icons/dmart.png" },
];

export default function HomeChatBar({ placeholder }: HomeChatBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showBrandList, setShowBrandList] = useState(false);

  // Close popup when clicking OUTSIDE
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowBrandList(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setShowBrandList(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mt-24 flex justify-center px-6">
      <div
        className="relative flex flex-col justify-between cursor-text backdrop-blur-xl"
        style={{
          width: 791,
          height: 160,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#FFFFFF70",
          background: "#00000059",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* INPUT */}
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-white/70 outline-none px-4"
          placeholder={placeholder ?? "Ask anything..."}
        />

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between items-center gap-4 px-8 pb-6">
          {/* LEFT SIDE: Plus Button + Selected Brand */}
          <div className="relative" ref={popupRef}>
            <div className="flex items-center justify-center gap-2">
              {/* + BUTTON */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBrandList(!showBrandList);
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>

              {/* BRAND POPUP LIST */}
              {showBrandList && (
                <div
                  className="absolute left-12 bottom-0 ranslate-y-14
                w-48 rounded-xl bg-black/45 backdrop-blur-xl border border-white/20
                shadow-lg p-2 space-y-1 animate-fade-in"
                >
                  {BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandSelect(brand)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    hover:bg-white/10 text-white text-sm"
                    >
                      <img src={brand.icon} className="w-5 h-5 rounded" />
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}

              {/* SELECTED BRAND CHIP */}
              {selectedBrand && (
                <div className="flex items-center gap-2 mt-3 bg-white/10 px-3 py-1 rounded-full w-max">
                  <img src={selectedBrand.icon} className="w-5 h-5 rounded" />
                  <span className="text-sm text-white">
                    {selectedBrand.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand(null);
                    }}
                    className="text-white/70 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white/90">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.2a1 1 0 01-1.41-1.42l8.49-8.49" />
              </svg>
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white/90">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
                <path d="M19 11a7 7 0 01-14 0" />
                <path d="M12 18v3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
