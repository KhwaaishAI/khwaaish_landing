import { useRef, useState, useEffect } from "react";
import AddOnSelector from "../pharmeasy/AddOnSelector";
import type { AddOn } from "../pharmeasy/AddOnSelector";
import AddOnChip from "../pharmeasy/AddOnChip";
import { usePharmEasyFlow } from "../pharmeasy/PharmEasyFlowContext";

interface HomeChatBarProps {
  placeholder?: string;
}

export default function HomeChatBar({ placeholder }: HomeChatBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { setActive, setStep, isActive } = usePharmEasyFlow();

  function handleSelect(addon: AddOn) {
    setSelectedAddOns((s) => [...s, addon]);
  }

  function handleRemove(id: string) {
    setSelectedAddOns((s) => s.filter((a) => a.id !== id));
    if (id === "pharmeasy" && isActive) {
      setActive(false);
      setStep("none");
    }
  }

  // Check if PharmEasy is selected and user has entered ordering instructions
  useEffect(() => {
    const hasPharmEasy = selectedAddOns.some((a) => a.id === "pharmeasy");
    const hasOrderingInstruction = inputValue.trim().length > 0;
    
    // Keywords that indicate ordering intent
    const orderingKeywords = [
      "order", "buy", "purchase", "get", "need", "want", 
      "medicine", "medicines", "tablet", "tablets", "prescription",
      "deliver", "delivery", "book", "place"
    ];
    
    const hasOrderingIntent = orderingKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword)
    );

    if (hasPharmEasy && (hasOrderingInstruction || hasOrderingIntent)) {
      if (!isActive) {
        setActive(true);
        setStep("booking");
      }
    } else if (!hasPharmEasy && isActive) {
      setActive(false);
      setStep("none");
    }
  }, [selectedAddOns, inputValue, isActive, setActive, setStep]);

  return (
    <div className="mt-24 flex justify-center px-6">
      <div
        className="relative flex flex-col justify-between cursor-text"
        style={{
          width: 791,
          height: 160,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#FFFFFFBF",
          background: "#00000059",
        }}

        onClick={() => inputRef.current?.focus()}
      >
       
        {/* Timeline: selected add-ons shown here */}
        <div className="px-8 pt-2 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {selectedAddOns.map((addon) => (
              <AddOnChip
                key={addon.id}
                icon={addon.icon}
                label={addon.label}
                onRemove={() => handleRemove(addon.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 pb-10 ">
          <div className="relative">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/5 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectorOpen((v) => !v);
              }}
              aria-label="Add integrations"
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

            <AddOnSelector
              isOpen={isSelectorOpen}
              selectedAddOns={selectedAddOns.map((a) => a.id)}
              onSelect={(a) => {
                handleSelect(a);
                setSelectorOpen(false);
              }}
              onClose={() => setSelectorOpen(false)}
            />
          </div>

          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-white/70 outline-none"
            placeholder={placeholder ?? "Ask anything..."}
          />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
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
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
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
  );
}
