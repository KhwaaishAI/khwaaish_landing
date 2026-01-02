// src/pages/Flipkart/components/LandingView.tsx

import { Link } from "react-router-dom";

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void;

  messageInput: string;
  setMessageInput: (v: string) => void;
  onSend: () => void;

  onNewChat: () => void;
};

export default function LandingView({
  sidebarOpen,
  setSidebarOpen,
  messageInput,
  setMessageInput,
  onSend,
  onNewChat,
}: Props) {
  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <aside
        className={
          `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
          `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
        }
      >
        <div className="flex justify-between items-center gap-2 px-4 py-3">
          <button
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <img
              src="/images/LOGO.png"
              alt="Khwaaish AI"
              className="h-12 w-auto sm:h-14 md:h-16 shrink-0 object-contain"
            />
          </button>
          <button
            aria-label="Toggle sidebar"
            className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
            onClick={() => setSidebarOpen((v: boolean) => !v)}
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="px-3">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            onClick={onNewChat}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New chat</span>
          </button>
        </div>

        <div className="mt-3 space-y-2 px-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>History</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Drafts</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
          {!sidebarOpen && (
            <button
              aria-label="Open sidebar"
              className="absolute left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <img
                src="/images/Circle.png"
                alt="Open sidebar"
                className="h-8 w-8 object-contain"
              />
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="p-2 hover:bg-gray-900 rounded-full transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-semibold">
                L
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3">
              <img src="/images/LOGO.png" alt="" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold">
                Welcome to Flipkart Shopping!
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Search for any product you want to buy
              </p>
            </div>

            <div className="w-full relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Search for products on Flipkart..."
                className="w-full rounded-full px-5 py-3 sm:px-6 sm:py-4 text-white placeholder-white/60"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onSend()}
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

            <div className="flex flex-wrap justify-center lg:flex-nowrap w-full gap-4">
              <Link
                to="/flipkart"
                className="relative w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl 
          border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Flipkart Shopping
                </h3>
                <p className="text-sm text-gray-400">
                  Search and buy products from Flipkart with voice commands
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
