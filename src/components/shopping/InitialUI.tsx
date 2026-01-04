import React, { useState } from "react";

interface InitialUIProps {
  onSearch: (query: string) => void;
}

const InitialUI: React.FC<InitialUIProps> = ({ onSearch }) => {
  const [messageInput, setMessageInput] = useState<string>("");

  const handleSend = () => {
    if (messageInput.trim()) {
      onSearch(messageInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <img src="/images/LOGO.png" alt="Logo" className="h-12" />
        </div>

        {/* Greeting */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
            Good to see you Laksh....
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            What can I help you with today?
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What is your khwaaish?"
            className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleSend}
              className={`p-2 ${
                messageInput
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-white/20 hover:bg-white/30"
              } rounded-full transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
          <div className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Shopping</h3>
            <p className="text-sm text-gray-400">
              Order Products at best price from Zara & Pantaloon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialUI;
