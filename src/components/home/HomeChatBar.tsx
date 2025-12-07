import { useRef, useState } from "react";
import { LuSend } from "react-icons/lu";

interface HomeChatBarProps {
  placeholder?: string;
  onSendMessage?: (text: string) => void;
  selectedCompany?: string | null;
  onSelectCompany?: (company: string | null) => void;
}

const COMPANIES = [
  "Swiggy",
  "Ola",
  "Zepto",
  "Booking",
  "Nykaa",
  "Oyo",
  "Instamart",
  "Pharmeasy",
  "Dmart",
  "TataCliqFashion",
  "JioMart",
];

export default function HomeChatBar({
  placeholder,
  onSendMessage,
  selectedCompany,
  onSelectCompany,
}: HomeChatBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showCompanies, setShowCompanies] = useState(false);
  const [inputText, setInputText] = useState("");

  // Local state fallback if props aren't provided (though we intend to provide them)
  const [localSelectedCompany, setLocalSelectedCompany] = useState<string | null>(
    null
  );

  const activeCompany =
    selectedCompany !== undefined ? selectedCompany : localSelectedCompany;

  const handleSelectCompany = (company: string | null) => {
    if (onSelectCompany) {
      onSelectCompany(company);
    } else {
      setLocalSelectedCompany(company);
    }
  };

  const handleSend = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="mt-24  flex justify-center px-6 transition-all duration-500 ease-in-out w-full">
      <div
        className="relative flex flex-col justify-between cursor-text transition-all duration-500 ease-in-out w-full"
        style={{
          maxWidth: 791,
          height: 160,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#FFFFFFBF",
          background: "#333333",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="px-8 pt-5 text-xs text-white/70">Ask anything...</div>
        <div className="flex items-center gap-4 px-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/5 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompanies(!showCompanies);
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
                  {showCompanies ? (
                    <>
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </>
                  ) : (
                    <>
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </>
                  )}
                </svg>
              </button>

              {showCompanies && (
                <div
                  className="absolute left-full bottom-0 ml-4 w-48 rounded-xl bg-black/90 border border-white/20 backdrop-blur-md p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {COMPANIES.map((company) => (
                    <button
                      key={company}
                      className="w-full flex items-center gap-3 text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => {
                        handleSelectCompany(company);
                        setShowCompanies(false);
                      }}
                    >
                      <img
                        src={`/icons/${company.toLowerCase()}.jpeg`}
                        alt={company}
                        className="w-6 h-6 rounded-full object-cover bg-white/10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span>{company}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeCompany && (
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-1 pr-3 py-1">
                <img
                  src={`/icons/${activeCompany.toLowerCase()}.jpeg`}
                  alt={activeCompany}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm text-white">{activeCompany}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCompany(null);
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-white/20"
                >
                  <svg
                    className="h-3 w-3 text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
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
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
          >
            <LuSend className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
