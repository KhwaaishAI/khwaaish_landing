import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "system"; text: string }>
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      {/* Sidebar - always visible */}
      <aside
        className={
          `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
          `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
        }
      >
        {/* Logo and collapse */}
        <div className="flex justify-between items-center gap-2 px-4 py-3">
          {/* Brand logo - clicking opens sidebar if ever used when closed */}
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
          {/* Collapse / Toggle inside sidebar */}
          <button
            aria-label="Toggle sidebar"
            className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-900"
            onClick={() => setSidebarOpen((v) => !v)}
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

        {/* New Chat */}
        <div className="px-3">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            onClick={() => {
              setShowChat(true);
              setMessages([]);
              setSearchText("");
              setMessageInput("");
            }}
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

        {/* Sections */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
          {/* Sidebar toggle */}
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                L
              </div>
            </div>
          </div>
        </div>

        {/* Main Content (no scroll on desktop) */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 sm:p-6 relative">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3">
              <img src="/images/LOGO.png" alt="Khwaaish AI" className="h-14 w-auto sm:h-16" />
            </div>
            {/* Greeting */}
            <div className="text-center space-y-2 md:space-y-3">
              <h2 className="text-2xl flex items-center justify-center sm:text-3xl font-semibold tracking-tight">
                Good to see you Laksh....
              </h2>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">
                What can I help you with today?
              </p>
            </div>

            {/* Background animation using Circle.png */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              {/* Top-right slowly spinning circle */}
              <img
                src="/images/Circle.png"
                alt=""
                className="hidden md:block absolute -top-24 -right-12 w-48 opacity-60 motion-safe:animate-spin"
                style={{ animationDuration: "18s" }}
              />
              {/* Center-right floating circle */}
              <img
                src="/images/Circle.png"
                alt=""
                className="hidden md:block absolute top-1/3 right-10 w-32 opacity-45 motion-safe:animate-bounce"
              />
              {/* Bottom-left soft pulse circle */}
              <img
                src="/images/Circle.png"
                alt=""
                className="hidden md:block absolute -bottom-24 -left-20 w-64 opacity-30 motion-safe:animate-pulse"
              />
            </div>

            {/* Service Cards */}
            <div className="mt-2 md:mt-4 rounded-3xl border border-gray-800/80 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-900/60 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-3 sm:mb-4 px-0 sm:px-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Quick actions</p>
                  <h3 className="text-lg sm:text-xl font-semibold">Explore services</h3>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1" />
                  Available now
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Groceries (Zepto) */}
                <Link
                  to="/groceries"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-green-400/70 hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md">
                      <img src="/logo/zepto.jpg" alt="Zepto" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Groceries</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Zepto groceries at your doorstep.
                  </p>
                </Link>

                {/* Swiggy Instamart (dedicated) */}
                <Link
                  to="/instamart"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-green-400/70 hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md border border-gray-200">
                      <img
                        src="/logo/swiggy-instamart.jpg"
                        alt="Swiggy Instamart"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Swiggy Instamart</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Fast groceries from Swiggy Instamart.
                  </p>
                </Link>

                {/* Ola */}
                <Link
                  to="/ola"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-yellow-400/70 hover:shadow-[0_0_25px_rgba(250,204,21,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/ola.jpg" alt="Ola" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Travels</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Book cabs in a single message.
                  </p>
                </Link>

                {/* Food (Swiggy) */}
                <Link
                  to="/food"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-orange-400/70 hover:shadow-[0_0_25px_rgba(249,115,22,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/swiggy.jpg" alt="Swiggy" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Food</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Swiggy orders from your favourite places.
                  </p>
                </Link>

                {/* Nykaa */}
                <Link
                  to="/nykaa"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-pink-400/70 hover:shadow-[0_0_25px_rgba(244,114,182,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/nkyaa.jpg" alt="Nykaa" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Beauty</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    personal care shopping.
                  </p>
                </Link>

                {/* JioMart */}
                <Link
                  to="/jiomart"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-sky-400/70 hover:shadow-[0_0_25px_rgba(56,189,248,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/jiomart.jpg" alt="JioMart" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Essentials</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Daily essentials &amp; groceries.
                  </p>
                </Link>

                {/* Tata Cliq */}
                <Link
                  to="/tatacliq"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-purple-400/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/tatacliq.jpg" alt="Tata Cliq" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Fasion</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Fashion &amp; lifestyle picks.
                  </p>
                </Link>


                {/* Medical (Pharmeasy) */}
                <Link
                  to="/pharmeasy"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-teal-400/70 hover:shadow-[0_0_25px_rgba(45,212,191,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/pharmeasy.jpg" alt="PharmEasy" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Medical</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    PharmEasy medicines &amp; healthcare.
                  </p>
                </Link>

                {/* Booking.com */}
                <Link
                  to="/booking"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-blue-400/70 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/booking.jpg" alt="Booking.com" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Hotels</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Find your next stay.
                  </p>
                </Link>

                {/* Agoda */}
                <Link
                  to="/agoda"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-pink-400/70 hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/Agoda-Logo.png" alt="Agoda" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Agoda</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Hotels & Homes.
                  </p>
                </Link>

                {/* Airbnb */}
                <Link
                  to="/airbnb"
                  className="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/80 hover:border-rose-400/70 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] px-4 py-3 sm:px-5 sm:py-4 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md mb-1">
                    <img src="/logo/airbnb.png" alt="Airbnb" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold">Airbnb</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                    Vacation rentals & more.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}
    </div>
  );
}
